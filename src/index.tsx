import React, { createElement, FC, Fragment, ReactNode, useCallback } from 'react';
import { parseDocument } from 'htmlparser2';
import { Element, Text, Node } from 'domhandler';

export interface Props {
    children: TagMap;
    html: string;
    decodeEntities?: boolean;

    // don't ignore tags that are not in our map.
    acceptUnknown?: boolean;
}

export type TagMap = {
    [tag in keyof Partial<JSX.IntrinsicElements>]: FC<JSX.IntrinsicElements[tag]> | null;
};

const HtmlMapper = ({ children: tagMap, html, acceptUnknown, decodeEntities = true }: Props) => {
    const render = useCallback(
        <N extends keyof JSX.IntrinsicElements, A = JSX.IntrinsicElements[N]>(
            name: N,
            props: A,
            index: number,
            children: ReactNode
        ) => {
            if (!name) {
                return <Fragment key={index}>{children}</Fragment>;
            }

            // TODO: can't find out why the type assert is needed, it _should_ work as-is.
            const Renderer = tagMap[name] as FC<A & { index: number }> | null | undefined;

            const defaultRenderer = () => createElement(name, { ...props, children, key: index });

            // renderer was specified, but with null, meaning we can safely render this.
            if (Renderer === null) {
                return defaultRenderer();
            }

            // no renderer was specified
            if (typeof Renderer === 'undefined') {
                return acceptUnknown ? defaultRenderer() : null;
            }

            return (
                <Renderer {...props} index={index} key={index}>
                    {children}
                </Renderer>
            );
        },
        [acceptUnknown, tagMap]
    );

    const transform = useCallback(
        (node: Node, index: number): ReactNode => {
            if (node instanceof Text) {
                return node.data;
            }

            if (node instanceof Element) {
                const name = node.name as keyof JSX.IntrinsicElements;
                const children = node.children?.map((childNode, i) => transform(childNode, i)) || null;
                return render(name, node.attribs, index, children);
            }

            return null;
        },
        [render]
    );

    const parsedDocument = parseDocument(html, { 
        decodeEntities,
        withStartIndices: false,
        withEndIndices: false 
    });

    return (
        <>
            {parsedDocument.children.map((node, index) => transform(node, index))}
        </>
    );
};

export default HtmlMapper;
