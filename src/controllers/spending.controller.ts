import { ObjectId } from '@datastax/astra-db-ts';
import { InvalidDataError, EntityNotFoundError } from '../lib/error-utils.ts';
import { getDb } from '../lib/db.ts';
import { COLLECTION_NAME as SPENDING_COLLECTION_NAME } from '../models/spending.model.ts';
import { COLLECTION_NAME as ANALYTICS_COLLECTION_NAME } from '../models/analytics.model.ts';

import { getCategories, Category } from '../lib/category.ts';
import { safeGetLocation } from '../lib/location.ts';
import { safeGetAnalytics } from '../lib/analytics.ts';

const categories = getCategories();

const db = getDb();
const Spending = db.collection(SPENDING_COLLECTION_NAME);
const Analytics = db.collection(ANALYTICS_COLLECTION_NAME);

const isValidCategory = (categoryId: number) => categories.some((cat: Category) => cat.id === categoryId);

function parseCustomDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // month is zero-based in JS Date
}

export const createSpending = async (req: any, res: any, next: any) => {
  const { price, category, date, lat, long, remark = '' } = req.body;
  const user = req.user;

  if (price === undefined || category === undefined || !date || lat === undefined || long === undefined) {
    return next(new InvalidDataError('All required spending details must be provided.'));
  }

  if (!isValidCategory(category)) {
    return next(new InvalidDataError('Invalid category provided.'));
  }

  const location = await safeGetLocation(lat, long);

  const analytic = await safeGetAnalytics(location, category);

  analytic.numberOfSpendings += 1;
  analytic.average = (analytic.average * (analytic.numberOfSpendings - 1) + Number(price)) / analytic.numberOfSpendings;
  await Analytics.updateOne({ _id: analytic._id }, { $set: { average: analytic.average, numberOfSpendings: analytic.numberOfSpendings } });

  const result = await Spending.insertOne({
    price,
    category,
    date: parseCustomDate(date),
    location: location._id,
    remark: remark,
    user: user._id,
  });

  res.status(201).json({ success: true, error: false, id: result.insertedId });
};

export const getUserSpendings = async (req: any, res: any, next: any) => {
  const userId = req.user._id;

  try {
    const spendings = await Spending.find({ user: userId }).toArray();
    res.status(200).json({ success: true, error: false, spendings });
  } catch (error) {
    next(error);
  }
};

export const getSpendingById = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const spending = await Spending.findOne({ _id: id, user: userId });

    if (!spending) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    res.status(200).json({ success: true, error: false, spending });
  } catch (error) {
    next(error);
  }
};

// TODO - Implement the updateSpending function




export const updateSpending = async (req: any, res: any, next: any) => {
  try {
      const { spendingId, price, category, date, remark } = req.body;
      const user = req.user;

      if (!spendingId) {
          return next(new InvalidDataError('Spending ID is required in the request body.'));
      }

      // Find the existing spending entry
      const existingSpending = await Spending.findOne({ _id: spendingId, user: user._id });

      if (!existingSpending) {
          return next(new EntityNotFoundError('Spending entry not found.'));
      }

      // Parse and validate date
      const parsedDate = parseCustomDate(date);

      // Get location (since location doesn't change)
      const location = await safeGetLocation(existingSpending.lat, existingSpending.long);

      if (existingSpending.category === category) {

          const analytic = await safeGetAnalytics(location, category);

          // Update total spending]
          const updatedTotalSpendings = (analytic.average * analytic.numberOfSpendings - existingSpending.price + Number(price));

          // Recalculate average
          analytic.average = updatedTotalSpendings / analytic.numberOfSpendings;

          await Analytics.updateOne(
              { _id: analytic._id },
              { $set: { average: analytic.average } }
          );

      } else {

      }

      await Spending.updateOne(
          { _id: spendingId },
          { $set: { price, category, date: parsedDate, remark } }
      );

      res.status(200).json({ success: true, error: false, message: 'Spending updated successfully.' });

  } catch (error) {
      next(error);
  }
};



export const deleteSpending = async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
      return next(new InvalidDataError('Spending ID is required.'));
    }

    // Find the spending entry first (to retrieve category, price, location)
    const existingSpending = await Spending.findOne({ _id: id, user: user._id });

    if (!existingSpending) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    // Get the related analytics entry
    const location = await safeGetLocation(existingSpending.lat, existingSpending.long);
    const analytic = await safeGetAnalytics(location, existingSpending.category);

    // Adjust analytics
    if (analytic.numberOfSpendings > 1) {
      analytic.average = ((analytic.average * analytic.numberOfSpendings) - existingSpending.price) / (analytic.numberOfSpendings - 1);
      analytic.numberOfSpendings -= 1;
    } else {
      analytic.average = 0;
      analytic.numberOfSpendings = 0;
    }

    // Update the analytics entry
    await Analytics.updateOne(
      { _id: analytic._id },
      { $set: { average: analytic.average, numberOfSpendings: analytic.numberOfSpendings } }
    );

    // Delete the spending record
    await Spending.findOneAndDelete({ _id: id });

    res.status(200).json({ success: true, error: false, message: 'Spending deleted successfully and analytics updated.' });

  } catch (error) {
    next(error);
  }
};

