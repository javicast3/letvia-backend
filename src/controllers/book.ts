import BookModel, { BookDoc } from '@/models/book';
import {
  CreateBookRequestHandler,
  UpdateBookRequestHandler,
} from '@/types';
import {
  formatFileSize,
  generateS3ClientPublicUrl,
  sendErrorResponse,
} from '@/utils/helper';
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ObjectId, Types } from 'mongoose';
import slugify from 'slugify';
import fs from 'fs';
import s3Client from '@/cloud/aws';
import { uploadBookToAws } from '@/utils/fileUpload';
import AuthorModel from '@/models/author';
import { RequestHandler } from 'express';
import UserModel from '@/models/user';

export const createNewBook: CreateBookRequestHandler = async (
  req,
  res
) => {
  const { body, files, user } = req;

  const {
    title,
    description,
    genre,
    language,
    // fileInfo,
    price,
    publicationName,
    publishedAt,
  } = body;

  const { cover } = files;

  const newBook = new BookModel<BookDoc>({
    title,
    description,
    genre,
    language,
    // fileInfo: { size: formatFileSize(fileInfo.size), id: '' },
    price,
    publicationName,
    publishedAt,
    slug: '',
    author: new Types.ObjectId(user.authorId),
  });

  newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
    lower: true,
    replacement: '-',
  });

  // this will upload cover to the cloud
  if (
    cover &&
    !Array.isArray(cover) &&
    cover.mimetype?.startsWith('image')
  ) {
    const uniqueFileName = slugify(
      `${newBook._id} ${newBook.title}.png`,
      {
        lower: true,
        replacement: '-',
      }
    );

    newBook.cover = await uploadBookToAws(
      cover.filepath,
      uniqueFileName
    );
  }

  await AuthorModel.findByIdAndUpdate(user.authorId, {
    $push: {
      books: newBook._id,
    },
  });
  await newBook.save();
  res.json({ message: 'Libro creado exitosamente' });
};

export const updateBook: UpdateBookRequestHandler = async (
  req,
  res
) => {
  const { body, files, user } = req;

  const {
    title,
    description,
    genre,
    language,
    price,
    publicationName,
    publishedAt,
    slug,
  } = body;

  const { cover } = files;
  const book = await BookModel.findOne({
    slug,
    author: user.authorId,
  });
  if (!book) {
    return sendErrorResponse({
      message: 'Libro no encontrado',
      status: 404,
      res,
    });
  }
  book.title = title;
  book.description = description;
  book.language = language;
  book.publicationName = publicationName;
  book.genre = genre;
  book.publishedAt = publishedAt;
  book.price = price;

  if (
    cover &&
    !Array.isArray(cover) &&
    cover.mimetype?.startsWith('image')
  ) {
    // remove old cover from the cloud (bucket)
    if (book.cover?.id) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_PUBLIC_BUCKET,
        Key: book.cover.id,
      });
      await s3Client.send(deleteCommand);
    }
    // upload new cover to the cloud (bucket)
    const uniqueFileName = slugify(`${book._id} ${book.title}.png`, {
      lower: true,
      replacement: '-',
    });

    book.cover = await uploadBookToAws(
      cover.filepath,
      uniqueFileName
    );
  }

  await book.save();
};

interface PopulatedBooks {
  cover?: {
    url: string;
    id: string;
  };
  _id: ObjectId;
  author: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
  title: string;
  slug: string;
}

export const getAllPurchasedBooks: RequestHandler = async (
  req,
  res
) => {
  const user = await UserModel.findById(req.user.id).populate<{
    books: PopulatedBooks[];
  }>({
    path: 'books',
    select: 'author title cover slug',
    // populate: { path: 'author', select: 'slug name' },
  });

  if (!user) return res.json({ books: [] });

  res.json({
    books: user.books.map((book) => ({
      id: book._id,
      title: book.title,
      cover: book.cover?.url,
      slug: book.slug,
      author: {
        name: book.author.name,
        slug: book.author.slug,
      },
    })),
  });
};
