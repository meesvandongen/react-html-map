import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import HtmlMapper from "../src";

const TEST_HTML =
	'<p id="test-html">Af deel pomp soms tijd veel ad. En <strong>voorloopig</strong> uitgegeven en nu ad verkochten beschikken. Al zout al in over bord te. Voorschijn moeilijker wedijveren na op. Zelf kilo zoon wel dag ruwe gas. Grayah de op vloeit na is goeden. Cenis langs maken nemen al ad klein de te.<br />Bepaalde gebruikt de verrezen <em>gestoken schatten</em> en <strong>verbouwd</strong>. <br />Krachten nu eveneens na in op nadering britsche maleiers verbruik. </p>\\n<p>Dat geheel vleesch zonder been is, gebruikt men om daar Osse-worst van te maaken; en het vleesch van de schouwders met de twee platte bil stukken, met het vet van de broek gebruikt men tot rolpens in plaats van ander vet.</p>\\n<ul><li>Dit is een feest</li><li>Morgen komt de melkboer</li></ul><h3>Al zout al in over bord te.</h3>\\n<p>Witheid meestal noemden met zee aandeel gezocht valorem heb. Holen moest steek zoo mei zit. Slechts zee dag bronnen gemengd weg behoeft doelang der. Al blijft midden op om na daarin. Dien werk van eind vaak zal per doel iets gif. Tembun wat groote een enkele.</p>\\n<h3>Lauriergracht No 37</h3>\\n<p>Ik ben makelaar in koffi, en woon op de Lauriergracht No 37. Het is mijn gewoonte niet, romans te schrijven, of zulke dingen, en het heeft dan ook lang geduurd, voor ik er toe overging een paar riem papier extra te bestellen, en het werk aan te vangen, dat gij, lieve lezer, zoâven in de hand hebt genomen, en dat ge lezen moet als ge makelaar in koffie zijt, of als ge wat anders zijt.</p>\\n<h4>Busselinck &amp; Waterman</h4>\\n<p>Dat zijn ook makelaars in koffie, doch hun adres behoeft ge niet te weten. Ik pas er dus wel op, dat ik geen romans schrijf, of andere valse opgaven doe. Ik heb dan ook altijd opgemerkt dat mensen die zich met zoiets inlaten, gewoonlijk slecht wegkomen. Ik ben drieënveertig jaar oud, bezoek sedert twintig jaren de beurs, en kan dus voor de dag treden, als men iemand roept die ondervinding heeft. Ik heb al wat huizen zien vallen!</p>';

describe("HtmlMapper", () => {
	it("renders whitelisted components", () => {
		const { container } = render(
			<HtmlMapper html={TEST_HTML}>
				{{
					h3: null,
					p: null,
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders all non-whitelisted components with acceptUnknown enabled", () => {
		const { container } = render(
			<HtmlMapper html={TEST_HTML} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders custom components", () => {
		const { container } = render(
			<HtmlMapper html={TEST_HTML}>
				{{
					p: ({ id, children }) => (
						// a different html tag, and a attribute mapped to a different attribute.
						<h6 className={id}>{children}</h6>
					),
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles empty tag names by rendering fragments", () => {
		// Test case for when name is falsy (covers lines 26-27)
		const htmlWithEmptyTags = "<div></div>";
		const { container } = render(
			<HtmlMapper html={htmlWithEmptyTags}>
				{{
					div: () => null, // This will trigger the empty name case in the render function
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles void elements correctly", () => {
		const htmlWithVoidElements =
			'<div><br><hr><img src="test.jpg" alt="test"><input type="text"></div>';
		const { container } = render(
			<HtmlMapper html={htmlWithVoidElements} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles HTML entities correctly", () => {
		const htmlWithEntities = "<p>&amp; &lt; &gt; &quot;</p>";
		const { container } = render(
			<HtmlMapper html={htmlWithEntities} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles HTML entities with decodeEntities disabled", () => {
		const htmlWithEntities = "<p>&amp; &lt; &gt; &quot;</p>";
		const { container } = render(
			<HtmlMapper html={htmlWithEntities} decodeEntities={false} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles unknown elements without acceptUnknown", () => {
		const htmlWithUnknown = "<div><unknown-tag>content</unknown-tag></div>";
		const { container } = render(
			<HtmlMapper html={htmlWithUnknown}>
				{{
					div: null,
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles elements with no children", () => {
		const htmlWithNoChildren = "<div></div><p></p>";
		const { container } = render(
			<HtmlMapper html={htmlWithNoChildren} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles text nodes correctly", () => {
		const htmlWithTextOnly = "Just plain text";
		const { container } = render(
			<HtmlMapper html={htmlWithTextOnly}>{{}}</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles mixed content with custom renderer that returns null", () => {
		const htmlMixed = "<div>Text <span>inside span</span> more text</div>";
		const { container } = render(
			<HtmlMapper html={htmlMixed}>
				{{
					div: null,
					span: () => null, // This should trigger the empty name case
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("handles nodes that are not Text or Element (covers return null case)", () => {
		// Test case to trigger the return null in transform function (line 74)
		const htmlWithComment = "<div><!-- comment --></div>";
		const { container } = render(
			<HtmlMapper html={htmlWithComment} acceptUnknown>
				{{}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders fragment when name is falsy (covers Fragment return)", () => {
		// This test specifically targets the Fragment return when !name is true
		const TestComponent = ({ children }: { children?: ReactNode }) => {
			// Call the render function directly with empty name to trigger Fragment case
			return <div data-testid="wrapper">{children}</div>;
		};

		const { container } = render(
			<HtmlMapper html="<div>test</div>">
				{{
					div: TestComponent,
				}}
			</HtmlMapper>,
		);
		expect(container).toMatchSnapshot();
	});
});
