import {IModelTree} from "@bim/types";
import {FC, memo, ReactElement} from "react";
import {MdPlayArrow} from "react-icons/md";
import {TiArrowSortedDown} from "react-icons/ti";
import {Checkbox} from "@/components/ui/checkbox";
const iconClassName = "h-[12px] w-[12px]";

const isTreeGroupActive = (treeGroup: IModelTree): boolean => {
  let checked = false;
  if (treeGroup.children.length === 0) {
    checked = treeGroup.checked;
  } else {
    checked = treeGroup.children.some((treeGroup) =>
      isTreeGroupActive(treeGroup)
    );
  }
  return checked;
};

const TreeItem: FC<Props> = ({treeItem, show, onCheck, onToggle, tool}) => {
  return (
    <div
      className={`group flex justify-between p-1 rounded-md my-1 hover:bg-slate-600 
      `}
    >
      <div className="flex justify-start gap-2">
        {treeItem.children.length > 0 && (
          <button
            className="border-none outline-none cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle!();
            }}
          >
            {show ? (
              <TiArrowSortedDown className={iconClassName} />
            ) : (
              <MdPlayArrow className={iconClassName} />
            )}
          </button>
        )}
        <Checkbox
          checked={isTreeGroupActive(treeItem)}
          onCheckedChange={(checked) => onCheck(treeItem, checked as boolean)}
          className="my-auto  group-hover:text-blue-700"
        />
        <p
          className="mx-2 capitalize 
  my-auto select-none 
  whitespace-nowrap overflow-hidden 
  overflow-ellipsis max-w-[200px] p-1 hover:text-white "
        >
          {treeItem.name}
        </p>
      </div>
      <div className="flex justify-end">{tool}</div>
    </div>
  );
};
interface Props {
  treeItem: IModelTree;
  show: boolean;
  onCheck: (treeItem: IModelTree, checked: boolean) => void;
  onToggle?: () => void;
  tool?: ReactElement;
}
export default memo(TreeItem);
