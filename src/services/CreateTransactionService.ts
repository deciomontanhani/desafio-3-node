import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    category,
    title,
    type,
    value,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(
        'cannot be able to create outcome transaction without a valid balance',
      );
    }

    let categoryObj = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryObj) {
      categoryObj = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryObj);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      category: categoryObj,
      value,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
