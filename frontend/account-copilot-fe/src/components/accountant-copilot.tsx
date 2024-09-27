"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type SearchResult = {
  answer: string;
  excerpts: Array<{
    content: string;
    reference: string;
  }>;
  followUpQuestions: string[];
};

type LoadingStep = "reading" | "referencing" | "summarizing";

export function AccountantCopilot() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("reading");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const handleSearch = async () => {
    if (!disclaimerAccepted) {
      alert("Please accept the disclaimer before proceeding.");
      return;
    }

    setLoading(true);
    setLoadingStep("reading");
    try {
      // Simulate different loading steps
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoadingStep("referencing");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoadingStep("summarizing");

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResult({
        answer: data.answer,
        excerpts: data.excerpts.map((excerpt: any) => ({
          content: excerpt.content,
          reference: excerpt.reference,
        })),
        followUpQuestions: [],
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAnswer = (answer: string) => {
    const sections = answer.split(/\d+\.\s/).filter(Boolean);
    return sections.map((section, index) => (
      <div key={index} className="mb-4">
        <h3 className="font-semibold mb-2">{`${index + 1}. ${
          section.split(":")[0]
        }`}</h3>
        <p>{section.split(":")[1]}</p>
      </div>
    ));
  };

  const loadingMessages = {
    reading: "AI is reading the tax bill document",
    referencing: "Figuring out the references relevant to what you want",
    summarizing: "Summarizing the information for you",
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Accountant Copilot</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Disclaimer: This AI assistant provides general information based on
            the tax documents it has been trained on. The information provided
            should not be considered as professional financial or legal advice.
            Please consult with a qualified accountant or tax professional for
            specific advice tailored to your individual circumstances.
          </p>
          <div className="flex items-center space-x-2">
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

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter your accounting query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
          disabled={!disclaimerAccepted}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !disclaimerAccepted}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <Tabs defaultValue="result" className="w-full">
        <TabsList>
          <TabsTrigger value="result" disabled={!result}>
            Search Result
          </TabsTrigger>
        </TabsList>
        <TabsContent value="result">
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">{renderAnswer(result.answer)}</div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="excerpts">
                    <AccordionTrigger>View Source Excerpts</AccordionTrigger>
                    <AccordionContent>
                      {result.excerpts.map((excerpt, index) => (
                        <Card key={index} className="mb-2">
                          <CardContent className="p-4">
                            <p className="mb-2">{excerpt.content}</p>
                            <p className="text-sm text-gray-500">
                              Reference: {excerpt.reference}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Follow-up Questions</h3>
                  <ul className="list-disc pl-5">
                    {result.followUpQuestions.map((question, index) => (
                      <li key={index} className="mb-1">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={loading} onOpenChange={setLoading}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Processing Your Query</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                {loadingMessages[loadingStep]}
              </p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
