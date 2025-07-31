import React, { useState, useEffect, useContext } from "react";
import { AccuracyContext } from "./Accuracybar";
import { Accuracybar } from "./Accuracybar";
import { animateScroll } from "react-scroll";
import styles from "./Results.module.css";
import "../../vars.css";
import axios from "axios";
import "react-circular-progressbar/dist/styles.css";

// props
export const Results = ({
  fileStored,
  textStored,
  fileContent,
  textContent,
  selection,
  showResults,
}) => {
  const [isParsing, setIsParsing] = useState(false); // parse file and text
  const [parsedData, setParsedData] = useState(null); // store parsed results
  const [error, setError] = useState(null); // store any errors
  const { setAccuracy, setAccuracyApi } = useContext(AccuracyContext); // object imports accuracy context

  // function for api resume parsing
  const parseResume = async (fileContent) => {
    setIsParsing(true);
    setError(null);

    try {
      // create FormData to send file to backend
      const formData = new FormData();
      formData.append("file", fileContent);

      // makes POST request to backend
      const response = await axios.post(
        "http://localhost:8080/parse",
        formData
      );
      setParsedData(response.data); // set parsed data
      setAccuracyApi(true);
      setTimeout(() => {}, 100);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsParsing(false);
    }
  };

  // function for no api parsing, scans job description for important info
  const parseText = (text) => {
    if (!text) return null;
    const lowerText = text.toLowerCase(); // convert to lowercase for case-insensitive matching

    // local database for education
    const education = [
      "high school diploma",
      "associate/s",
      "bachelor/s",
      "master/s",
      "doctorate",
    ];
    const foundEducation = education.filter((ed) =>
      lowerText.includes(ed.toLowerCase())
    );

    // local database for experience in certain fields
    const experience = [
      "software engineering",
      "data science",
      "web development",
      "frontend engineering",
      "backend engineering",
      "full stack engineering",
      "game development",
      "intern",
    ];
    const foundExperience = experience.filter((exp) =>
      lowerText.includes(exp.toLowerCase())
    );

    // local database for resume keywords/skills
    const skills = [
      "html",
      "css",
      "javascript",
      "react",
      "typescript",
      "angular",
      "vue",
      "jquery",
      "ember",
      "node.js",
      "django",
      "ruby",
      "express",
      "python",
      "pytorch",
      "java",
      "swift",
      "lua",
      "bender",
      "sql",
      "r",
      "postgresql",
      "matlab",
      "next.js",
      "c++",
      "c",
      "c#",
      "mongodb",
      "git",
      "docker",
      "aws",
      "azure",
      "project management",
      "leadership",
      "communication",
      "teamwork",
      "problem solving",
      "analytical",
      "creative",
      "detail-oriented",
      "data structures and algorithms",
      "github",
      "fundamentals",
    ];
    // parse for skills
    const foundSkills = skills.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    );

    // parse for sentences
    const sentences = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 10);

    return {
      education: foundEducation,
      experience: foundExperience,
      skills: foundSkills,
      sentences: sentences.slice(0, 5),
    };
  };

  const handleParse = () => {
    if (textContent && textContent.trim() !== "") {
      const parsed = parseText(textContent);
      // format the data to match api response structure
      const formattedData = {
        education: parsed.education || [],
        experience: parsed.experience || [],
        skills: parsed.skills || [],
        sentences: parsed.sentences || [],
      };
      setParsedData(formattedData);
    }
  };

  // calculates accuracy match
  useEffect(() => {
    if (parsedData && textContent) {
      // calculates based on matching skills
      const parsedSkills = parsedData.skills || [];
      const textSkills = parseText(textContent)?.skills || [];
      const matchingSkills = parsedSkills.filter((skill) =>
        textSkills.some(
          (textSkill) =>
            textSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(textSkill.toLowerCase())
        )
      );
      // calculates accuracy percentage
      const totalSkills = Math.max(parsedSkills.length, textSkills.length);
      const accuracyPercentage =
        totalSkills > 0
          ? Math.round((matchingSkills.length / totalSkills) * 100)
          : 0;
      setAccuracy(accuracyPercentage);
      setAccuracyApi(true);
    }
  }, [parsedData, textContent]);

  // auto-parse when selection is made and requirements are met
  useEffect(() => {
    if (selection && fileStored && textContent && textContent.trim() !== "") {
      // parsing method based on selection
      if (selection === "api") {
        parseResume(fileContent);
      } else if (selection === "noapi") {
        handleParse();
        // accuracy bars cannot load for no api bc this only parses jd
      }
    }
  }, [selection, fileStored, textContent]);

  // refresh page for new scans
  const refreshPage = () => {
    window.location.reload(false);
  };

  // auto-scroll feature
  const scroll = {
    duration: 500,
    smooth: true,
  };

  // only render results if progress bar is 100%
  if (!showResults) {
    return null;
  } else {
    animateScroll.scrollToBottom(scroll);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Results:</h2>
      <Accuracybar />
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>Error: {error}</div>
      )}
      {parsedData && (
        <div className={styles.parsedData}>
          <h2>Parsed Summary:</h2>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
      <div className={styles.resetContent}>
        <p style={{ textAlign: "center", color: "var(--color-secondary)" }}>
          Scan Again
        </p>
        <button className={styles.resetBtn} onClick={refreshPage}>
          Reset
        </button>
      </div>
    </div>
  );
};
