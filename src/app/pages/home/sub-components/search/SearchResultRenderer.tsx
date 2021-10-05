import * as React from 'react';
import { getIconClass } from '../../../../shared-components/editors/Editors';
import { IDocument, IPageDocumentMetaData, services } from './../../../../services/services';
import { DocumentType } from '../../../../services/services';
import { PageSearchResult } from './PageSearchResult';
import { SectionSearchResult } from './SectionSearchResult';

interface Props {
    searchText: string;
    documents: IDocument[];
    goToPageFromSearch: (pageId: number) => void;
    goToSectionFromSearch: (sectionId: number) => void;
    allSections:ISection[];
}

export const SearchResultRenderer: React.FunctionComponent<Props> = (props) => {
    const sections = props.allSections;
    const regex = new RegExp(props.searchText, "gi");
    
    return <div className="search-results">
        {props.documents.length === 0 && <div className="text-center">No Results</div>}
        {props.documents.map((w, i) => {
            let index = w.content!.toLowerCase().indexOf(props.searchText.toLowerCase());

            let prepend = "";
            let affix = "";
            let start = index - 75;

            if (start < 0) {
                start = 0;
            }

            if (start > 0) {
                prepend = "...";
            }

            let end = start + 150;

            if (end > w.content!.length) {
                end = w.content!.length;
            }

            if (end != w.content!.length) {
                affix = "...";
            }

            const text = `${prepend}${w.content!.substring(start, end)}${affix}`
            const meta = (w.meta as IPageDocumentMetaData | null)
            const section = sections.find(x => x.sectionId == meta?.sectionId);
            let pageIconClassName = "";

            if (meta?.subType) {
                pageIconClassName = getIconClass(meta.subType)!
            }

            return w.type == DocumentType.Page ? <PageSearchResult
                key={`search-result-page-${i}`}
                content={text}
                id={w.id}
                name={w.name}
                number={i + 1}
                onClick={props.goToPageFromSearch}
                regex={regex}
                searchText={props.searchText}
                sectionName={section?.sectionName}
                iconClassName={pageIconClassName}
            /> : <SectionSearchResult
                key={`search-result-section-${i}`}
                content={text}
                id={w.id}
                name={w.name}
                number={i + 1}
                onClick={props.goToSectionFromSearch}
                regex={regex}
                searchText={props.searchText}
            />
        })}
    </div>
}