import type { Node } from "domhandler";
import { Element, Text } from "domhandler";
import { parseDocument } from "htmlparser2";
import type { FC, ReactNode } from "react";
import { createElement, Fragment, useCallback, useMemo } from "react";

export interface Props {
	children: TagMap;
	html: string;
	decodeEntities?: boolean;

	// don't ignore tags that are not in our map.
	acceptUnknown?: boolean;
}

type IntrinsicElements = React.JSX.IntrinsicElements;
type IntrinsicName = keyof IntrinsicElements & string;

export type TagMap = {
	[tag in keyof Partial<IntrinsicElements>]: FC<IntrinsicElements[tag]> | null;
};

const VOID_ELEMENTS = new Set([
	"br",
	"hr",
	"img",
	"input",
	"meta",
	"link",
	"area",
	"base",
	"col",
	"embed",
	"source",
	"track",
	"wbr",
]);

export function HtmlMapper({
	children: tagMap,
	html,
	acceptUnknown,
	decodeEntities = true,
}: Props) {
	const render = useCallback(
		<N extends IntrinsicName, A = IntrinsicElements[N]>(
			name: N,
			props: A,
			index: number,
			children: ReactNode,
		) => {
			if (!name) {
				return <Fragment key={index}>{children}</Fragment>;
			}

			const Renderer = tagMap[name] as
				| FC<A & { index: number }>
				| null
				| undefined;

			const defaultRenderer = () =>
				createElement(name, { ...props, children, key: index });

			// renderer was specified, but with null, meaning we can safely render this.
			if (Renderer === null) {
				return defaultRenderer();
			}

			// no renderer was specified
			if (typeof Renderer === "undefined") {
				return acceptUnknown ? defaultRenderer() : null;
			}

			return (
				<Renderer {...(props as A)} index={index} key={index}>
					{children}
				</Renderer>
			);
		},
		[acceptUnknown, tagMap],
	);

	const transform = useCallback(
		(node: Node, index: number): ReactNode => {
			if (node instanceof Text) {
				return node.data;
			}

			if (node instanceof Element) {
				const name = node.name as IntrinsicName;

				let children: ReactNode = null;
				if (!VOID_ELEMENTS.has(name)) {
					children =
						node.children?.map((childNode, i) => transform(childNode, i)) ||
						null;
				}

				return render(
					name,
					node.attribs as unknown as IntrinsicElements[IntrinsicName],
					index,
					children,
				);
			}

			return null;
		},
		[render],
	);

	const parsedDocument = useMemo(
		() =>
			parseDocument(html, {
				decodeEntities,
				withStartIndices: false,
				withEndIndices: false,
			}),
		[html, decodeEntities],
	);

	const content = useMemo(
		() => parsedDocument.children.map((node, index) => transform(node, index)),
		[parsedDocument, transform],
	);

	return <>{content}</>;
}

export default HtmlMapper;
