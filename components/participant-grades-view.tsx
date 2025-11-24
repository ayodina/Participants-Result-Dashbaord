"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  MODE_LABELS,
  PARTICIPATION_LABELS,
  SUBMISSION_LABELS,
  type ModuleCategory,
  type Module,
  type StudentModuleAssessment,
} from "@/lib/module-types"
import { BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface ParticipantGradesViewProps {
  studentId: string
}

export function ParticipantGradesView({ studentId }: ParticipantGradesViewProps) {
  const [categories, setCategories] = useState<ModuleCategory[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [assessments, setAssessments] = useState<StudentModuleAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadModuleData()
  }, [studentId])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("module_categories")
        .select("*")
        .order("order_index")

      if (categoriesError) throw categoriesError

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .order("category_id, order_index")

      if (modulesError) throw modulesError

      // Load assessments for this student
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("student_module_assessments")
        .select("*")
        .eq("student_id", studentId)

      if (assessmentsError) throw assessmentsError

      setCategories(categoriesData || [])
      setModules(modulesData || [])
      setAssessments(assessmentsData || [])
    } catch (err: any) {
      console.error("Error loading module data:", err)
      setError(err.message || "Failed to load module data")
    } finally {
      setLoading(false)
    }
  }

  const getModulesForCategory = (categoryId: string) => {
    return modules.filter((m) => m.category_id === categoryId)
  }

  const getAssessmentForModule = (moduleId: string) => {
    return assessments.find((a) => a.module_id === moduleId)
  }

  const calculateCategoryCompletion = (categoryId: string) => {
    const categoryModules = getModulesForCategory(categoryId)
    if (categoryModules.length === 0) return 0

    const completedModules = categoryModules.filter((module) => {
      const assessment = getAssessmentForModule(module.id)
      return assessment && assessment.attendance === 1
    })

    return Math.round((completedModules.length / categoryModules.length) * 100)
  }

  const renderAttendanceBadge = (attendance: number) => {
    if (attendance === 1) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Attended
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
        <XCircle className="h-3 w-3 mr-1" />
        Not Attended
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your module assessments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Module System Not Initialized</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                The detailed module tracking system is not yet available. Please contact your administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No modules have been set up yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{modules.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modules Attended</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {assessments.filter((a) => a.attendance === 1).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Categories Tabs */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Module Assessments by Category</CardTitle>
          <CardDescription className="dark:text-gray-400">
            View your attendance, participation, and performance across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={categories[0]?.id} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-normal h-auto py-2 px-3 text-xs"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-center">{category.name}</span>
                    <span className="text-[10px] opacity-80 mt-1">
                      {calculateCategoryCompletion(category.id)}% complete
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                {getModulesForCategory(category.id).length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No modules in this category yet.</p>
                ) : (
                  <div className="space-y-3">
                    {getModulesForCategory(category.id).map((module) => {
                      const assessment = getAssessmentForModule(module.id)

                      return (
                        <Card key={module.id} className="dark:bg-gray-800 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{module.name}</h4>
                                {assessment?.term && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Term: {assessment.term}</p>
                                )}
                              </div>
                              {assessment ? renderAttendanceBadge(assessment.attendance) : renderAttendanceBadge(0)}
                            </div>

                            {assessment ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {assessment.mode && (
                                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Mode</p>
                                    <p className="font-medium dark:text-white">{MODE_LABELS[assessment.mode]}</p>
                                  </div>
                                )}

                                <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">Participation</p>
                                  <p className="font-medium dark:text-white">
                                    {PARTICIPATION_LABELS[assessment.participation]}
                                  </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">Submission</p>
                                  <p className="font-medium dark:text-white">
                                    {SUBMISSION_LABELS[assessment.submission]}
                                  </p>
                                </div>

                                {module.has_quiz && assessment.quiz_score !== undefined && (
                                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Quiz</p>
                                    <p className="font-medium dark:text-white">
                                      {assessment.quiz_score === 1 ? "Passed" : "Not Passed"}
                                    </p>
                                  </div>
                                )}

                                {module.has_posts && (
                                  <>
                                    {assessment.post1 !== undefined && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Post 1</p>
                                        <p className="font-medium dark:text-white">
                                          {SUBMISSION_LABELS[assessment.post1]}
                                        </p>
                                      </div>
                                    )}
                                    {assessment.post2 !== undefined && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Post 2</p>
                                        <p className="font-medium dark:text-white">
                                          {SUBMISSION_LABELS[assessment.post2]}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No assessment recorded yet
                              </p>
                            )}

                            {assessment?.notes && (
                              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                                <p className="text-sm dark:text-gray-300">{assessment.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
