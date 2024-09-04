import { RequestHandler } from 'express';
import { z, ZodRawShape } from 'zod';

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

export const validate = <T extends ZodRawShape>(
  obj: T
): RequestHandler => {
  return (req, res, next) => {
    const schema = z.object(obj);
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
