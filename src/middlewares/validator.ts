import { RequestHandler } from 'express';
import { z, ZodObject, ZodRawShape, ZodType } from 'zod';

export const emailValidationSchema = {
  email: z
    .string({
      required_error: 'Email requerido',
      invalid_type_error: 'Tipo inválido',
    })
    .email('Email no válido'),
};
export const newUserSchema = {
  name: z
    .string({
      required_error: 'Nombre es requerido',
      invalid_type_error: 'Nombre no válido',
    })
    .min(
      3,
      'Nombre debe tener una extensión mínima de 3 de caracteres'
    )
    .trim(),
};

export const newAuthorSchema = z.object({
  name: z
    .string({
      required_error: 'Nombre es requerido!',
      invalid_type_error: 'Nombre no válido',
    })
    .trim()
    .min(3, 'Nombre no válido'),
  about: z
    .string({
      required_error: 'About es requerido',
      invalid_type_error: 'About no valido',
    })
    .trim()
    .min(100, 'Please write at least 100 characters about yourself!'),
  socialLinks: z
    .array(z.string().url('Social links deben ser URLs válidas'))
    .optional(),
});
export const newBookSchema = z.object({
  title: z
    .string({
      required_error: 'El Título es requerido',
      invalid_type_error: 'Título no válido',
    })
    .trim(),
  description: z
    .string({
      required_error: 'La Descripción es requerido',
      invalid_type_error: 'Descripción no válida',
    })
    .trim(),
  language: z
    .string({
      required_error: 'El Lenguaje es requerido',
      invalid_type_error: 'Lenguaje no válido',
    })
    .trim(),
  publishedAt: z.coerce.date({
    required_error: 'La Fecha de publicación es requerida',
    invalid_type_error: 'Fecha de publicación no válida',
  }),
  publicationName: z
    .string({
      required_error: 'La Editorial es requerida',
      invalid_type_error: 'Editorial no válida',
    })
    .trim(),
  genre: z
    .string({
      required_error: 'El Género es requerido',
      invalid_type_error: 'Género no válido',
    })
    .trim(),
  price: z
    .string({
      required_error: 'El precio es requerido',
      invalid_type_error: 'Precio no válido',
    })
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: 'Precio no válido',
        });
        return z.NEVER;
      }
    })
    .pipe(
      z.object({
        mrp: z
          .number({
            required_error: 'MRP es requerido',
            invalid_type_error: 'MRP no válido',
          })
          .nonnegative('MRP no válido'),
        sale: z
          .number({
            required_error: 'El precio de venta es requerido',
            invalid_type_error: 'Precio de venta no válido',
          })
          .nonnegative('Precio de venta no válido'),
      })
    )
    // if the validator function returns false the error will be thrown
    .refine(
      (price) => price.sale <= price.mrp,
      'Sale price should be less then mrp!'
    ),
  // fileInfo: z
  //   .string({
  //     required_error: 'File info es requerido',
  //     invalid_type_error: 'File info no válido',
  //   })
  //   .transform((value, ctx) => {
  //     try {
  //       return JSON.parse(value);
  //     } catch (error) {
  //       ctx.addIssue({
  //         code: 'custom',
  //         message: 'File info no válido',
  //       });
  //       return z.NEVER;
  //     }
  //   })
  //   .pipe(
  //     z.object({
  //       name: z
  //         .string({
  //           required_error: 'fileInfo.name es requerido',
  //           invalid_type_error: 'FileInfo.name no válido',
  //         })
  //         .trim(),
  //       type: z
  //         .string({
  //           required_error: 'fileInfo.type es requerido',
  //           invalid_type_error: 'FileInfo.type no válido',
  //         })
  //         .trim(),
  //       size: z
  //         .number({
  //           required_error: 'fileInfo.size es requerido',
  //           invalid_type_error: 'FileInfo.size no válido',
  //         })
  //         .nonnegative('FileInfo.size no válido'),
  //     })
  //   ),
});

export const validate = <T extends ZodRawShape>(
  schema: ZodObject<T>
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json({ errors });
    }
  };
};
