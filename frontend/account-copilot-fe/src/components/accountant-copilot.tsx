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

type SearchResult = {
  answer: string;
  excerpts: Array<{
    content: string;
    reference: string;
  }>;
  followUpQuestions: string[]; // Keep this if you want to add it in the future
};

export function AccountantCopilot() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
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
        followUpQuestions: [], // Your API doesn't provide this, so we'll leave it empty
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      // You might want to set an error state here to display to the user
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

  const sampleResult: SearchResult = {
    answer:
      "1. Direct Answer: Filing taxes for yacht expenses involves identifying deductible expenses such as maintenance, rental, insurance, and travel costs if used for business. These must be reported on the prescribed form within 12 months after the filing-due date.\n\n2. Explanation: Taxpayers can deduct certain yacht-related expenses if not reimbursed. These include maintenance, rental, insurance, and business travel costs. All expenses must be reported on the prescribed form within the specified timeframe.\n\n3. Relevant Example: A taxpayer using a yacht for client meetings can deduct fuel, maintenance, insurance, and depreciation costs. These must be reported in detail on the tax form within the given deadline.\n\n4. Additional Information: Tax laws may vary by jurisdiction. Consult a tax professional for accurate and compliant filing.\n\n5. References: Information based on Excerpts 1, 2, 3, and 5.",
    excerpts: [
      {
        content:
          "to the extent that the taxpayer has not been reimbursed, and is not entitled to be reimbursed in respect thereof;\nMotor vehicle and aircraft costs\nwhere a deduction may be made under paragraph 8(1)(f), 8(1)(h) or 8(1)(h.1) in computing the taxpayer's income from an office or employment for a taxation year,\nany interest paid by the taxpayer in the year on borrowed money used for the purpose of acquiring, or on an amount payable for the acquisition of, property that is\na motor vehicle that is used, or\nan aircraft that is required for use\nin the performance of the duties of the taxpayer's office or employment, and\nsuch part, if any, of the capital cost to the taxpayer of\na motor vehicle that is used, or\nan aircraft that is required for use\nin the performance of the duties of the office or employment as is allowed by regulation;",
        reference: "1",
      },
      {
        content:
          "amounts expended by the taxpayer before the end of the year for the maintenance, rental or insurance of the instrument for that period, except to the extent that the amounts are otherwise deducted in computing the taxpayer's income for any taxation year, and\nsuch part, if any, of the capital cost to the taxpayer of the instrument as is allowed by regulation;",
        reference: "2",
      },
    ],
    followUpQuestions: [
      "What specific documentation is required for yacht expense deductions?",
      "Are there limits to the amount of yacht expenses that can be deducted?",
      "How does the IRS determine if a yacht is used primarily for business or personal use?",
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Accountant Copilot</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter your accounting query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <Tabs defaultValue="sample" className="w-full">
        <TabsList>
          {/* <TabsTrigger value="sample">Sample Output</TabsTrigger> */}
          <TabsTrigger value="result" disabled={!result}>
            Search Result
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sample">
          <Card>
            <CardHeader>
              <CardTitle>Sample Output: Yacht Expense Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">{renderAnswer(sampleResult.answer)}</div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="excerpts">
                  <AccordionTrigger>View Source Excerpts</AccordionTrigger>
                  <AccordionContent>
                    {sampleResult.excerpts.map((excerpt, index) => (
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
                  {sampleResult.followUpQuestions.map((question, index) => (
                    <li key={index} className="mb-1">
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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
    </div>
  );
}
