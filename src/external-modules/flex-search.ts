import * as FS from 'flexsearch';

interface IFlexSearch {
    create<T>(options?: FS.CreateOptions): FS.Index<T>;
    registerMatcher(matcher: FS.Matcher): any;
    registerEncoder(name: string, encoder: FS.EncoderFn): any;
    registerLanguage(lang: string, options: { stemmer?: FS.Stemmer; filter?: string[] }): any;
    encode(name: string, str: string): any;
}


export interface Index<T> extends FS.Index<T> {
    //update: (document: any) => void;
};
export const FlexSearch: IFlexSearch = FS as any;