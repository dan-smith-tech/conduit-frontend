import { Editor, Node } from "slate";

import {
	LuBold,
	LuCode,
	LuHeading1,
	LuHeading2,
	LuHeading3,
	LuItalic,
	LuStrikethrough,
} from "react-icons/lu";

import FormatButton from "../buttons/FormatButton";

import styles from "./FixedFormatMenu.module.css";

export default function FixedMenu({ editor }: { editor: Editor }) {
	return (
		<div className={styles.container}>
			<div className={styles.element}>
				<FormatButton
					editor={editor}
					isNode={true}
					type={"heading"}
					options={{ level: 1 }}
				>
					<LuHeading1 />
				</FormatButton>
				<FormatButton
					editor={editor}
					isNode={true}
					type={"heading"}
					options={{ level: 2 }}
				>
					<LuHeading2 />
				</FormatButton>
				<FormatButton
					editor={editor}
					isNode={true}
					type={"heading"}
					options={{ level: 3 }}
				>
					<LuHeading3 />
				</FormatButton>
			</div>
			<div className={styles.element}>
				<FormatButton editor={editor} isNode={false} type={"bold"}>
					<LuBold />
				</FormatButton>
				<FormatButton editor={editor} isNode={false} type={"italic"}>
					<LuItalic />
				</FormatButton>
				<FormatButton editor={editor} isNode={false} type={"strikethrough"}>
					<LuStrikethrough />
				</FormatButton>
				<FormatButton editor={editor} isNode={false} type={"code"}>
					<LuCode />
				</FormatButton>
			</div>
		</div>
	);
}
