import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import TypeCheckboxes from "../components/TypeCheckboxes";
import { useRecoilValue, selector } from "recoil";
import { typeObjectAtom } from "../components/TypeCheckboxes";
import { idAtom } from "../components/Common";

type FromScratchProps = {
  fromScratchSubmit: (submitData: Object) => void;
};

export const fromScratchSelector = selector({
  key: `fromScratchSelector_${Math.random()}`,
  get: ({ get }) => {
    const id = get(idAtom);
    const typeObject = get(typeObjectAtom);
    return {
      id,
      typeObject,
      createOption: "fromScratch",
    };
  },
});

function FromScratch({ fromScratchSubmit }: FromScratchProps) {
  const fromScratchData = useRecoilValue(fromScratchSelector);

  return (
    <>
      <TypeCheckboxes />
      <div className="submitAndReset">
        <VSCodeButton className="submitButton" onClick={() => fromScratchSubmit(fromScratchData)}>
          Next
        </VSCodeButton>
      </div>
    </>
  );
}

export default FromScratch;
