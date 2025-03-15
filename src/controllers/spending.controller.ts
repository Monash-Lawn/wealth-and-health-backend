import { ObjectId } from '@datastax/astra-db-ts';
import { InvalidDataError, EntityNotFoundError } from '../lib/error-utils.ts';
import { getDb } from '../lib/db.ts';
import { COLLECTION_NAME as SPENDING_COLLECTION_NAME } from '../models/spending.model.ts';

import { getCategories, Category } from '../lib/category.ts';


const categories = getCategories();


const db = getDb();
const Spending = db.collection(SPENDING_COLLECTION_NAME);

const isValidCategory = (categoryId: number) => categories.some((cat: Category) => cat.id === categoryId);

export const createSpending = async (req: any, res: any, next: any) => {
  const { price, category, date, location, remark, user } = req.body;

  if (!price || !category || !date || !location || !user) {
    return next(new InvalidDataError('All required spending details must be provided.'));
  }

  if (!isValidCategory(category)) {
    return next(new InvalidDataError('Invalid category provided.'));
  }

  try {
    const result = await Spending.insertOne({
      price,
      category,
      date: new Date(date),
      location: new ObjectId(location),
      remark: remark || '',
      user: new ObjectId(user),
    });

    res.status(201).json({ success: true, error: false, id: result.insertedId });
  } catch (error) {
    next(error);
  }
};

export const getUserSpendings = async (req: any, res: any, next: any) => {
  const { userId } = req.params;

  try {
    const spendings = await Spending.find({ user: new ObjectId(userId) }).toArray();
    const enhancedSpendings = spendings.map((spending) => ({
      ...spending,
      categoryName: categories.find((cat) => cat.id === spending.category)?.name || 'unknown',
    }));
    res.status(200).json({ success: true, error: false, spendings: enhancedSpendings });
  } catch (error) {
    next(error);
  }
};

export const getSpendingById = async (req: any, res: any, next: any) => {
  const { id } = req.params;

  try {
    const spending = await Spending.findOne({ _id: new ObjectId(id) });

    if (!spending) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    const enhancedSpending = {
      ...spending,
      categoryName: categories.find((cat) => cat.id === spending.category)?.name || 'unknown',
    };

    res.status(200).json({ success: true, error: false, spending: enhancedSpending });
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
    const deleted = await Spending.findOneAndDelete({ _id: new ObjectId(id) });

    if (!deleted) {
      return next(new EntityNotFoundError('Spending not found.'));
    }

    res.status(200).json({ success: true, error: false, message: 'Spending deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
