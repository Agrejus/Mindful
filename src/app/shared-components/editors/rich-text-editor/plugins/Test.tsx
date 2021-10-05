import * as React from 'react';
import { ContentBlock, DraftDecorator } from "draft-js";
import { EditorPlugin } from '@draft-js-plugins/editor';
import Link, { LinkProps } from './Link';

export type Plugin =  EditorPlugin & {
    decorator: DraftDecorator;
  };

const extractLinks = (text: string, type: string) => {

    const result: { value: string, index: number, lastIndex: number }[] = [];
    const regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    let match;
    while ((match = regex.exec(text)) != null) {
        result.push({
            value: match[0],
            index: match.index,
            lastIndex: match.index + match[0].length
        });
    }

    return result;
}

const linkStrategy = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void
): void => {
    const links = extractLinks(contentBlock.getText(), contentBlock.getType());
    if (links) {
        for (const link of links) {
            callback(link.index, link.lastIndex);
        }
    }
};

export default (config: any = {}): Plugin => {
    const {
        component,
        theme = 'link',
        target = '_self',
        rel = 'noreferrer noopener',
    } = config;

    const DecoratedLink = (props: LinkProps): React.ReactElement => (
        <Link
            {...props}
            theme={theme}
            target={target}
            rel={rel}
            component={component}
            className="link"
        />
    );

    const decorator =  {
        strategy: linkStrategy,
        component: DecoratedLink
    }

    return {
        decorators: [decorator],
        decorator: decorator
    };
}

const Media = (props: any) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    const type = entity.getType();
    return <a className="test" />;
};