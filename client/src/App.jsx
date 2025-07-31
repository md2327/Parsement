import React, { useState, createContext } from "react";
import { Import } from "/src/components/Import/Import";
import { Parser } from "/src/components/Parser/Parser";
import { Progressbar } from "/src/components/Progressbar/Progressbar";
import { Results } from "/src/components/Results/Results";
import { Accuracybar } from "/src/components/Results/Accuracybar";
import { AccuracyContextProvider } from "/src/components/Results/Accuracybar";

// parent component
function App() {
  // states variables purple
  const [fileUploaded, setFileUploaded] = useState(false);
  const [textFilled, setTextFilled] = useState(false);
  const [selection, setSelection] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [textContent, setTextContent] = useState(""); // for text parsing
  const [showResults, setShowResults] = useState(false);

  // check for file before scanning
  const handleFileUpload = () => {
    setFileUploaded(true);
  };

  // check for job description before scanning
  const handleTextFill = (text) => {
    setTextFilled(true);
    setTextContent(text); // store actual text content
  };

  // check for parsing option before scanning
  const handleSelection = (option) => {
    setSelection(option); // store which option was selected ('api' or 'noapi')
  };

  // stores file for api parsing
  const handleFileContent = (file) => {
    setFileContent(file); // store as actual file
  };

  // toggles active/inactive results
  const handleShowResults = () => {
    setShowResults(true);
  };

  return (
    // pass as props
    <div>
      <AccuracyContextProvider>
        <Import
          onFileUpload={handleFileUpload}
          onTextFill={handleTextFill}
          onFileContent={handleFileContent}
        />
        <Parser onSelection={handleSelection} selection={selection} />
        <Progressbar
          fileUploaded={fileUploaded}
          textFilled={textFilled}
          selection={selection}
          onShowResults={handleShowResults}
        />
        <Results
          fileStored={fileUploaded}
          textStored={textFilled} // check if text content exist
          fileContent={fileContent}
          textContent={textContent}
          selection={selection}
          showResults={showResults}
        />
      </AccuracyContextProvider>
    </div>
  );
}

export default App;
