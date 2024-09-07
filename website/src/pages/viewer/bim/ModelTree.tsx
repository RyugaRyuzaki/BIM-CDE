import {FC, memo, useState} from "react";
import TreeItem from "./TreeItem";
import {IModelTree} from "@bim/types";
import {Button} from "@/components/ui/button";
import {FaUpload} from "react-icons/fa";

const ModelTree: FC<Props> = ({treeItem, onCheck}) => {
  const [show, setShow] = useState<boolean>(false);

  const onToggle = () => {
    setShow(!show);
  };

  return (
    <>
      <TreeItem
        treeItem={treeItem}
        show={show}
        onToggle={onToggle}
        onCheck={onCheck}
      />
      <div className={`ml-5 ${show ? "visible" : "hidden"}`}>
        {treeItem.children.length === 0 ? (
          <p className="text-center">No Items</p>
        ) : (
          <>
            {treeItem.children.map((child) => (
              <ModelTree key={child.id} treeItem={child} onCheck={onCheck} />
            ))}
          </>
        )}
      </div>
    </>
  );
};
interface Props {
  treeItem: IModelTree;
  onCheck: (treeItem: IModelTree, checked: boolean) => void;
}
export default memo(ModelTree);
