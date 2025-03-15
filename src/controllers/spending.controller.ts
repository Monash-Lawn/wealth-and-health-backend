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

  if (!price || !category || !date || !lat || !long) {
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

export const updateSpending = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.category && !isValidCategory(updates.category)) {
    return next(new InvalidDataError('Invalid category provided.'));
  }

  try {
    const updated = await Spending.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    res.status(200).json({ success: true, error: false, spending: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSpending = async (req: any, res: any, next: any) => {
  const { id } = req.params;

  try {
    const deleted = await Spending.findOneAndDelete({ _id: id });

    if (!deleted) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    res.status(200).json({ success: true, error: false, message: 'Spending deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
