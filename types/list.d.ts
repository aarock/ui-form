import { ButtonProps, TextProps, YStackProps } from "@aarock/ui-core";
export declare function List(props: YStackProps): any;
export declare namespace List {
    var Item: typeof ListItem;
    var Text: typeof ListText;
}
type ListItemProps = {
    isSelected?: boolean;
};
declare function ListItem({ children, isSelected, onPress, ...props }: ButtonProps & ListItemProps): any;
declare function ListText({ ...props }: TextProps): any;
export {};
//# sourceMappingURL=list.d.ts.map