"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ThumbsUp,
  ThumbsDown,
  Send,
  Copy,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SearchResult = {
  query: string;
  answer: string;
  excerpts: Array<{
    content: string;
    reference: string;
  }>;
  followUps: SearchResult[];
};

type LoadingStep = "reading" | "referencing" | "summarizing";

const MAX_QUERIES = 20;
const MAX_FOLLOW_UPS = 5;

export function AccountantCopilot() {
  const [mainQuery, setMainQuery] = useState("");
  const [followUpQueries, setFollowUpQueries] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("reading");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [feedback, setFeedback] = useState<("positive" | "negative" | null)[]>(
    []
  );
  const [queriesLeft, setQueriesLeft] = useState(MAX_QUERIES);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState<boolean[]>([]);

  useEffect(() => {
    const storedQueries = localStorage.getItem("queriesLeft");
    if (storedQueries) {
      setQueriesLeft(parseInt(storedQueries, 10));
    }
  }, []);

  const handleSearch = useCallback(
    async (parentIndex?: number) => {
      if (!disclaimerAccepted) {
        alert("Please accept the disclaimer before proceeding.");
        return;
      }

      if (queriesLeft <= 0) {
        setShowCreditDialog(true);
        return;
      }

      const currentQuery =
        parentIndex !== undefined
          ? followUpQueries[parentIndex] || ""
          : mainQuery;

      if (!currentQuery.trim()) {
        return;
      }

      setLoading(true);
      setLoadingStep("reading");
      try {
        const targetUrl =
          "https://manual-marti-bhaulik-70305df9.koyeb.app/query";

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: currentQuery, top_k: 5 }),
        });

        console.log("Response:", response);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const newResult: SearchResult = {
          query: currentQuery,
          answer: data.answer,
          excerpts: data.excerpts.map(
            (excerpt: { content: string; reference: string }) => ({
              content: excerpt.content,
              reference: excerpt.reference,
            })
          ),
          followUps: [],
        };

        if (parentIndex !== undefined) {
          setResults((prev) => {
            const newResults = [...prev];
            // Check if the follow-up query already exists
            const existingFollowUpIndex = newResults[
              parentIndex
            ].followUps.findIndex(
              (followUp) => followUp.query === currentQuery
            );
            if (existingFollowUpIndex === -1) {
              // If it doesn't exist, add it
              newResults[parentIndex].followUps.push(newResult);
            } else {
              // If it exists, update it
              newResults[parentIndex].followUps[existingFollowUpIndex] =
                newResult;
            }
            return newResults;
          });
          setFollowUpQueries((prev) => {
            const newQueries = [...prev];
            newQueries[parentIndex] = "";
            return newQueries;
          });
        } else {
          setResults((prev) => [...prev, newResult]);
          setFollowUpQueries((prev) => [...prev, ""]);
          setMainQuery("");
        }

        setFeedback((prev) => [...prev, null]);
        setCopied((prev) => [...prev, false]);

        const newQueriesLeft = queriesLeft - 1;
        setQueriesLeft(newQueriesLeft);
        localStorage.setItem("queriesLeft", newQueriesLeft.toString());
      } catch (error) {
        console.error("Error fetching search results:", error);
        alert("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [disclaimerAccepted, queriesLeft, followUpQueries, mainQuery]
  );

  const handleRegenerate = useCallback(
    async (index: number) => {
      if (queriesLeft <= 0) {
        setShowCreditDialog(true);
        return;
      }

      setLoading(true);
      setLoadingStep("reading");

      try {
        // Simulating API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoadingStep("referencing");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoadingStep("summarizing");

        // TODO: Replace with actual API call
        const response = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: results[index].query,
            top_k: 5,
            regenerate: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const newResult: SearchResult = {
          query: results[index].query,
          answer: data.answer,
          excerpts: data.excerpts.map(
            (excerpt: { content: string; reference: string }) => ({
              content: excerpt.content,
              reference: excerpt.reference,
            })
          ),
          followUps: [],
        };

        setResults((prev) => {
          const newResults = [...prev];
          newResults[index] = newResult;
          return newResults;
        });

        setFeedback((prev) => {
          const newFeedback = [...prev];
          newFeedback[index] = null;
          return newFeedback;
        });

        setCopied((prev) => {
          const newCopied = [...prev];
          newCopied[index] = false;
          return newCopied;
        });

        const newQueriesLeft = queriesLeft - 1;
        setQueriesLeft(newQueriesLeft);
        localStorage.setItem("queriesLeft", newQueriesLeft.toString());
      } catch (error) {
        console.error("Error regenerating response:", error);
        alert("Failed to regenerate response. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [queriesLeft, results]
  );

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((prev) => {
        const newCopied = [...prev];
        newCopied[index] = true;
        return newCopied;
      });
      setTimeout(() => {
        setCopied((prev) => {
          const newCopied = [...prev];
          newCopied[index] = false;
          return newCopied;
        });
      }, 2000);
    });
  }, []);

  const renderAnswer = useCallback(
    (result: SearchResult, index: number, isFollowUp = false) => {
      const sections = result.answer.split(/\d+\.\s/).filter(Boolean);
      return (
        <div className={`mb-4 ${isFollowUp ? "ml-4 border-l-2 pl-4" : ""}`}>
          <p className="font-semibold mb-2">Q: {result.query}</p>
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="mb-4"
            >
              <h3 className="font-semibold mb-2">{`${sectionIndex + 1}. ${
                section.split(":")[0]
              }`}</h3>
              <p>{section.split(":")[1]}</p>
            </motion.div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(result.answer, index)}
            className="mt-2"
          >
            {copied[index] ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied[index] ? "Copied!" : "Copy Response"}
          </Button>
          {result.excerpts && result.excerpts.length > 0 && (
            <div className="excerpts-section mt-4">
              <h4 className="font-semibold mb-2">Excerpts:</h4>
              <ul className="list-disc pl-5">
                {result.excerpts.map((excerpt, excerptIndex) => (
                  <li key={`${index}-excerpt-${excerptIndex}`} className="mb-2">
                    <p>{excerpt.content}</p>
                    <p className="text-sm text-gray-500">
                      Source: {excerpt.reference}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    },
    [handleCopy, copied]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const loadingMessages = {
    reading: "AI is reading the tax bill document",
    referencing: "Figuring out the references relevant to what you want",
    summarizing: "Summarizing the information for you",
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Accountant Copilot
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              This AI assistant provides general information based on the tax
              documents it has been trained on. The information provided should
              not be considered as professional financial or legal advice.
              Please consult with a qualified accountant or tax professional for
              specific advice tailored to your individual circumstances.
            </AlertDescription>
          </Alert>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="disclaimer"
              checked={disclaimerAccepted}
              onCheckedChange={(checked) =>
                setDisclaimerAccepted(checked as boolean)
              }
            />
            <Label
              htmlFor="disclaimer"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand and accept the disclaimer
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <motion.div
          className={`relative border rounded-lg transition-all ${
            isFocused ? "shadow-lg" : "shadow"
          }`}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            placeholder="Ask me anything about tax documents..."
            value={mainQuery}
            onChange={(e) => setMainQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 pr-12 resize-none overflow-hidden bg-transparent"
            rows={3}
            disabled={!disclaimerAccepted}
          />
          <Button
            className="absolute right-2 bottom-2"
            disabled={loading || mainQuery.trim() === "" || !disclaimerAccepted}
            onClick={() => handleSearch()}
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {loading ? "Loading..." : "Ask"}
          </Button>
        </motion.div>
      </div>

      {loading && (
        <div className="mb-6">
          <div className="animate-pulse text-center font-semibold">
            {loadingMessages[loadingStep]}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Search Results {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderAnswer(result, index)}

                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="follow-up">
                    <AccordionTrigger>Follow-up questions</AccordionTrigger>
                    <AccordionContent>
                      {result.followUps.map((followUp, followUpIndex) => (
                        <div key={`${index}-${followUpIndex}`} className="mt-4">
                          {renderAnswer(
                            followUp,
                            index * MAX_FOLLOW_UPS + followUpIndex,
                            true
                          )}
                        </div>
                      ))}

                      {result.followUps.length < MAX_FOLLOW_UPS && (
                        <div className="mt-4">
                          <Textarea
                            placeholder="Ask a follow-up question..."
                            value={followUpQueries[index] || ""}
                            onChange={(e) =>
                              setFollowUpQueries((prev) => {
                                const newQueries = [...prev];
                                newQueries[index] = e.target.value;
                                return newQueries;
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            rows={2}
                          />
                          <Button
                            onClick={() => handleSearch(index)}
                            disabled={
                              loading ||
                              !followUpQueries[index] ||
                              followUpQueries[index].trim() === ""
                            }
                            className="mt-2"
                          >
                            Ask Follow-up
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerate(index)}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    {loading ? "Regenerating..." : "Regenerate Response"}
                  </Button>
                  <Button
                    variant={
                      feedback[index] === "positive" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFeedback((prev) => {
                        const newFeedback = [...prev];
                        newFeedback[index] = "positive";
                        return newFeedback;
                      })
                    }
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Helpful
                  </Button>
                  <Button
                    variant={
                      feedback[index] === "negative" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFeedback((prev) => {
                        const newFeedback = [...prev];
                        newFeedback[index] = "negative";
                        return newFeedback;
                      })
                    }
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Not Helpful
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Out of Queries</DialogTitle>
          </DialogHeader>
          <p>
            You&apos;ve reached the maximum number of queries for today. Please
            come back tomorrow or upgrade your plan to continue asking
            questions.
          </p>
          <DialogFooter>
            <Button onClick={() => setShowCreditDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
