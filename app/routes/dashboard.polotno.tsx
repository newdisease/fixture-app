import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useActionData, useNavigation, useSubmit } from '@remix-run/react'
import { Upload, Loader2 } from 'lucide-react'
import { createInstance } from 'polotno-node'
import { useRef } from 'react'
import { z } from 'zod'

import { siteConfig } from '~/utils/constants/brand'

export const ROUTE_PATH = '/dashboard/polotno/' as const

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} | Polotno` }]
}

export const JsonFileSchema = z.object({
  jsonFile: z
    .any()
    .refine((file) => file?.type === 'application/json', 'Only JSON files are allowed'),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const jsonFile = formData.get('jsonFile') as File

  const jsonContent = await jsonFile.text()
  const jsonData = JSON.parse(jsonContent)

  const instance = await createInstance({
    key: 'nFA5H9elEytDyPyvKL7T',
    timeout: 30000, // 30 seconds
    // Disable sandboxing for better compatibility with Remix.
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
    ],
  })

  try {
    const base64Image = await instance.jsonToImageBase64(jsonData)
    await instance.close()

    return Response.json({
      status: 'success',
      image: `data:image/png;base64,${base64Image}`,
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        message: 'An error occurred while converting the JSON file to an image.',
      },
      { status: 400 },
    )
  }
}

export default function Polotno() {
  const lastResult = useActionData<typeof action>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)

  const [form, { jsonFile }] = useForm({
    lastResult,
    constraint: getZodConstraint(JsonFileSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: JsonFileSchema })
    },
  })

  const handleFileChange = () => {
    if (!formRef.current) return
    submit(formRef.current, { method: 'POST' })
  }

  const isLoading = navigation.state === 'submitting'

  return (
    <div className="flex h-full w-full px-6 py-8">
      <div className="mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex h-full w-full flex-col gap-6">
          <Form
            method="POST"
            ref={formRef}
            encType="multipart/form-data"
            onChange={handleFileChange}
            {...getFormProps(form)}
            className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
            <div className="flex w-full flex-col gap-4 rounded-lg p-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium text-primary">
                  JSON to Image Converter
                </h2>
                <p className="text-sm font-normal text-primary/60">
                  Upload a JSON file to convert it into an image using Polotno.
                </p>
              </div>

              <label
                className={`relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${isLoading ? 'pointer-events-none opacity-70' : ''} `}>
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  {isLoading ? (
                    <>
                      <Loader2 className="mb-2 h-6 w-6 animate-spin text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Converting...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-6 w-6 text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose JSON file
                      </p>
                    </>
                  )}
                </div>
                <input
                  {...getInputProps(jsonFile, { type: 'file' })}
                  key="jsonFile"
                  accept="application/json"
                  className="hidden"
                  required
                  disabled={isLoading}
                />
              </label>

              {jsonFile.errors ? (
                <p className="text-sm text-destructive dark:text-destructive-foreground">
                  {jsonFile.errors.join(' ')}
                </p>
              ) : null}
            </div>
          </Form>

          {/* Image Preview */}
          {lastResult?.status === 'success' ? (
            <div className="w-full rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-medium text-primary">Generated Image</h3>
              <img
                src={lastResult.image}
                alt="Generated from JSON"
                className="max-w-full rounded-lg"
              />
            </div>
          ) : null}

          {/* Error Display */}
          {lastResult?.status === 'error' ? (
            <div className="w-full rounded-lg border border-destructive bg-destructive/10 p-6">
              <p className="text-sm text-destructive">{lastResult.message}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
