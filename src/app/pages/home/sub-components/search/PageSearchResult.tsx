import * as React from 'react'

interface Props {
    number: number;
    name: string;
    content: string;
    searchText: string;
    regex: RegExp;
    onClick: (id: number) => void;
    id: number;
    sectionName: string | undefined;
    iconClassName: string;
}

export const PageSearchResult: React.FunctionComponent<Props> = (props) => {
    const headerHtml = `${props.name.replace(props.regex, `<a>${props.searchText}</a>`)}`;
    return <div className="search-result clickable" onClick={() => props.onClick(props.id)}>
        <span className="search-result-number">{props.number}.</span>
        <div>
            <i className={props.iconClassName}></i>
            <span className="search-result-title" dangerouslySetInnerHTML={{ __html: headerHtml }}></span>
        </div>
        {!!props.content && <p dangerouslySetInnerHTML={{ __html: props.content.replace(props.regex, `<a>${props.searchText}</a>`) }}></p>}
        <div>
            <small>Type: Page</small><span className="separator"></span><small>Section: {props.sectionName}</small>
        </div>
    </div>
}