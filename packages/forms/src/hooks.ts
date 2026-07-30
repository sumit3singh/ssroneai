import { z } from "zod";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";

export const useFormWithZod = <T extends FieldValues>(schema: z.ZodType<T>, options?: Parameters<typeof useForm>[0]) => {
    return useForm<T>({
        resolver: async (values) => {
            try {
                const result = schema.parse(values as T);
                return { values: result, errors: {} };
            } catch (error) {
                return {
                    values: {},
                    errors: (error as z.ZodError).formErrors.fieldErrors,
                };
            }
        },
        ...options,
    });
};
