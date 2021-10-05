export abstract class Indexable<TResult = string> {
    [key:string]:TResult;
}