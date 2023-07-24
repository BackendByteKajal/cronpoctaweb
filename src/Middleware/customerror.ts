import { Context, Next } from "koa";
import { ValidationError } from "joi";
import { error } from "console";

export async function fileSizeErrorHandler(ctx: Context, next: Next) {
  try {
    console.log("next")
    await next();
  } catch (err) {

    throw new Error("You are not Authenticated.")
      

  }
}