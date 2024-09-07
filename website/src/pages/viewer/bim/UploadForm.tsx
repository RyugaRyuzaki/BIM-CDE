"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {Label} from "@components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {modelIdSignal, versionIdSignal} from "@bim/signals/loader";

const formSchema = z.object({
  modelId: z.string().min(3, {
    message: "modelId must be at larger than 100",
  }),
  versionId: z.string().min(12, {
    message: "VersionId must be at least 12 characters.",
  }),
});

const UploadForm = ({uploadServer}: {uploadServer: () => void}) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelId: modelIdSignal.value!,
      versionId: versionIdSignal.value!,
    },
  });

  const onSubmit = (_values: z.infer<typeof formSchema>) => {
    uploadServer();
  };
  return (
    <div className="w-full border-b-1 p-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="modelId"
            render={({field}) => (
              <FormItem>
                <FormLabel>ModelId</FormLabel>
                <FormControl>
                  <Input
                    placeholder="101"
                    {...field}
                    required
                    disabled={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="versionId"
            render={({field}) => (
              <>
                <FormItem>
                  <FormLabel>VersionId</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={"101"}
                      {...field}
                      required
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />

          <div className="w-full flex items-center">
            <TooltipProvider delayDuration={10}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    type="submit"
                    className="w-[100%] m-auto flex justify-center bg-gradient-to-r
                            from-cyan-500 to-blue-500
                            disabled:cursor-none
                            disabled:opacity-35
                            "
                  >
                    <Label className="mx-2">Upload</Label>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="text-white bg-slate-900"
                >
                  Upload server
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UploadForm;
