"use client";
import { Setting } from "@/lib/editor/DEPRECATED-editor-options";
import { Block } from "@/lib/streaming-client/src";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  AlertTriangleIcon,
  ChevronsUpDownIcon,
  Loader2,
  MinusCircleIcon,
  PlusCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { AutoResizeTextarea } from "../ui/textarea";
import { TypographyH3 } from "../ui/typography/TypographyH3";
import { TypographyLead } from "../ui/typography/TypographyLead";
import { TypographyMuted } from "../ui/typography/TypographyMuted";
import { AudioPreview } from "./audio-preview";
// import TagListElement from "./tag-list-element";
import dynamic from "next/dynamic";
import { useRecoilState } from "recoil";
import { recoilErrorModalState } from "../providers/recoil";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { TypographyLarge } from "../ui/typography/TypographyLarge";
import { TypographyP } from "../ui/typography/TypographyP";
import ImageInputElement from "./image-input-element";
import { ImagePreview } from "./image-preview";
import ProgramInputElement from "./program-input-element";

const TagListElement = dynamic(() => import("./tag-list-element"), {
  ssr: false,
});

function findPromptVariables(input: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const matches = input.match(regex);

  if (matches) {
    return matches.map((match) => match.slice(1, -1));
  }
  return [];
}

export default function SettingElement({
  setting,
  updateFn,
  valueAtLoad,
  suggestField,
  previewField,
  inlined = false,
  existingDynamicThemes = [],
  keypath = [],
  isUserApproved,
  isApprovalRequested,
  adventureId = "",
  latestAgentVersion = "",
}: {
  setting: Setting;
  updateFn: (key: string, value: any) => void;
  valueAtLoad: any;
  keypath: (string | number)[];
  suggestField: (
    fieldName: string,
    fieldKeyPath: (string | number)[],
    setSuggesting: (val: boolean) => void,
    setValue: (val: string) => void
  ) => void;
  previewField: (
    fieldName: string,
    fieldKeyPath: (string | number)[],
    setImagePreviewLoading: (val: boolean) => void,
    setImagePreview: (val: string | undefined) => void,
    setImagePreviewBlock: (val: Block | undefined) => void
  ) => void;
  inlined?: boolean;
  existingDynamicThemes?: { value: string; label: string }[];
  isUserApproved: boolean;
  isApprovalRequested: boolean;
  adventureId?: string;
  latestAgentVersion: string;
}) {
  let [value, setValue] = useState(valueAtLoad || setting.default);
  let [imagePreview, setImagePreview] = useState<string | undefined>();
  let [imagePreviewBlock, setImagePreviewBlock] = useState<Block>();
  let [imagePreviewLoading, setImagePreviewLoading] = useState<boolean>(false);
  let [suggesting, setSuggesting] = useState<boolean>(false);
  const [_, setError] = useRecoilState(recoilErrorModalState);

  let [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      const optionList = [
        ...(setting.options || []),
        ...(setting.includeDynamicOptions == "image-themes"
          ? existingDynamicThemes
          : []),
      ];
      for (let o of optionList) {
        if (o.value == value && (o as any).imageSample) {
          setImagePreview((o as any).imageSample);
          return;
        }
      }
      setImagePreview(undefined);
    }
  }, [
    value,
    setting.options,
    setting.includeDynamicOptions,
    existingDynamicThemes,
  ]);

  // Validations
  useEffect(() => {
    if (value && setting.variablesPermitted) {
      if (typeof value == "string") {
        const variablesUsed = findPromptVariables(value);
        let errors = [];
        for (let variableUsed of variablesUsed) {
          if (typeof setting.variablesPermitted[variableUsed] == "undefined") {
            errors.push(
              `- The prompt variable {${variableUsed}} is not supported for this setting.`
            );
          }
        }
        setValidationErrors(errors);
      } else {
        setValidationErrors([]);
      }
    } else {
      setValidationErrors([]);
    }
  }, [value, setting.variablesPermitted]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newValue = e.target.files[0];
    updateFn(setting.name, newValue);
  };

  const onTextboxChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setValue(newValue);
    updateFn(setting.name, newValue);
  };

  const onTextboxIntChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = parseInt(e.target.value);
    if (
      typeof setting.min !== "undefined" &&
      setting.min >= 0 &&
      newValue < setting.min
    ) {
      setValue(setting.min);
      updateFn(setting.name, setting.min);
      return;
    }
    setValue(newValue);
    updateFn(setting.name, newValue);
  };

  const onTextboxFloatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = parseFloat(e.target.value);
    if (
      typeof setting.min !== "undefined" &&
      setting.min >= 0 &&
      newValue < setting.min
    ) {
      setValue(setting.min);
      updateFn(setting.name, setting.min);
      return;
    }
    setValue(newValue);
    updateFn(setting.name, newValue);
  };

  const onCheckboxChange = (checked: boolean) => {
    setValue(checked);
    updateFn(setting.name, checked);
  };

  const onSelectChange = (newValue: string) => {
    setValue(newValue);
    updateFn(setting.name, newValue);
  };

  const preview = async () => {
    if (!setting.previewOutputType) {
      return;
    }
    previewField(
      setting.previewOutputType,
      keypath,
      setImagePreviewLoading,
      setImagePreview,
      setImagePreviewBlock
    );
  };

  const suggest = async () => {
    if (!setting.suggestOutputType) {
      return;
    }
    suggestField(
      setting.suggestOutputType,
      keypath,
      setSuggesting,
      (val: string) => {
        setValue(val);
        updateFn(setting.name, val);
      }
    );
  };

  const addToList = (e: any) => {
    const newVal =
      setting.listof == "object" ? {} : setting.listof == "text" ? "" : null;
    setValue((old: any) => {
      const ret = [...(Array.isArray(old) ? old : []), newVal];
      updateFn(setting.name, ret);
      return ret;
    });
  };

  const removeItem = (i: number) => {
    setValue((old: any) => {
      const ret = (old || []).filter((_: any, index: number) => {
        return i != index;
      });
      updateFn(setting.name, ret);
      return ret;
    });
  };

  const updateItem = ({
    index,
    subField,
    value,
  }: {
    index: number;
    subField?: string;
    value: any;
  }) => {
    setValue((old: any) => {
      // Go through the old items.
      const ret = (old || []).map((prior: any, thisIndex: number) => {
        // If this is the item being updated.
        if (index === thisIndex) {
          if (subField) {
            // If it's a subfield, the set that subfield assuming it's an object
            // Note: this code only works one layer deep.
            prior[subField] = value;
            return prior;
          } else {
            // Else, it's a primitive value.
            return value;
          }
        } else {
          // If this isn't the item being updated, return as is.
          return prior;
        }
      });
      updateFn(setting.name, ret);
      return ret;
    });
  };

  let innerField = <></>;
  const isDisabled = false; // setting.requiresApproval && !isUserApproved;

  if (setting.type === "text") {
    innerField = (
      <Input
        isLoadingMagic={suggesting}
        disabled={suggesting}
        type="text"
        value={value}
        onChange={onTextboxChange}
      />
    );
  } else if (setting.type === "int") {
    innerField = (
      <Input
        type="number"
        step="1"
        value={value}
        onChange={onTextboxIntChange}
        isLoadingMagic={suggesting}
        disabled={suggesting}
        min={setting.min || 0}
      />
    );
  } else if (setting.type === "float") {
    innerField = (
      <Input
        type="number"
        value={value}
        onChange={onTextboxFloatChange}
        isLoadingMagic={suggesting}
        disabled={suggesting}
        min={setting.min || 0}
      />
    );
  } else if (setting.type === "image") {
    innerField = (
      <ImageInputElement
        onInputChange={onInputChange}
        value={value}
        isDisabled={isDisabled}
        setting={setting}
      />
    );
  } else if (setting.type === "program") {
    innerField = (
      <ProgramInputElement
        onInputChange={onInputChange}
        value={value}
        isDisabled={isDisabled}
        setting={setting}
      />
    );
  } else if (setting.type === "textarea") {
    innerField = (
      <AutoResizeTextarea
        value={value}
        onChange={onTextboxChange}
        disabled={isDisabled || suggesting}
        isLoadingMagic={suggesting}
      />
    );
  } else if (setting.type === "boolean") {
    innerField = (
      <div key={setting.name} className="flex items-center space-x-2">
        <Switch
          checked={!!value}
          id={setting.name}
          name={setting.name}
          onCheckedChange={onCheckboxChange}
          disabled={isDisabled}
        />
        <Label htmlFor={setting.name}>{value ? "Yes" : "No"}</Label>
      </div>
    );
  } else if (setting.type === "select") {
    const options = [
      ...(setting.options || []),
      ...(setting.includeDynamicOptions === "image-themes"
        ? existingDynamicThemes
        : []),
    ];
    innerField = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="my-4 px-4">
            <div className="mr-2">{value}</div>
            <ChevronsUpDownIcon size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="hover:cursor-pointer"
              onClick={(e) => {
                onSelectChange(option.value || "");
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else if (setting.type == "options") {
    innerField = (
      <div className="space-y-2">
        {setting.options?.map((option) => (
          <div key={option.value} className="flex flex-row">
            <Input
              type="radio"
              checked={value === option.value ? true : undefined}
              id={option.value}
              name={setting.name}
              value={option.value}
              onChange={onTextboxChange}
              disabled={isDisabled}
            />
            <label className="select-none flex-grow" htmlFor={option.value}>
              <div className="flex flex-row items-start">
                {option?.audioSample && (
                  <AudioPreview voiceId={option.audioSample} />
                )}
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-muted-foreground">
                  {option.description}
                </div>
              )}
            </label>
          </div>
        ))}
      </div>
    );
  } else if (setting.type == "longtext") {
    innerField = (
      <AutoResizeTextarea
        onChange={onTextboxChange}
        value={value}
        disabled={isDisabled || suggesting}
        isLoadingMagic={suggesting}
      />
    );
  } else if (setting.type == "upgrade-offer") {
    const updateButton =
      latestAgentVersion == value ? (
        <TypographyMuted>This is the latest version! </TypographyMuted>
      ) : (
        <Button
          onClick={(e) => {
            setValue(latestAgentVersion);
            updateFn(setting.name, latestAgentVersion);
          }}
        >
          Upgrade to {latestAgentVersion}
        </Button>
      );
    innerField = (
      <div>
        <Input
          isLoadingMagic={suggesting}
          disabled={suggesting}
          type="text"
          value={value}
          onChange={onTextboxChange}
        />
        <div className="mt-2">{updateButton}</div>
      </div>
    );
  } else if (setting.type == "tag-list") {
    const _value = Array.isArray(value) ? value : [];
    innerField = (
      <TagListElement
        value={_value}
        setValue={(newArr: string[]) => {
          setValue(newArr);
          updateFn(setting.name, newArr);
        }}
        disabled={isDisabled}
      />
    );
  } else if (setting.type == "divider") {
    innerField = (
      <div className="pt-4 pb-2">
        <TypographyH3>{setting.label}</TypographyH3>
        <TypographyMuted>{setting.description}</TypographyMuted>
      </div>
    );
  } else if (setting.type == "list") {
    const _value = Array.isArray(value) ? value : [];
    innerField = (
      <div>
        <ul>
          {_value.map((subValue: any, i: number) => {
            const remove = () => {
              removeItem(i);
            };
            return (
              <li
                key={`${setting.name}.${i}`}
                className="flex flex-row items-start space-y-3"
              >
                <button onClick={remove} className="px-4 mt-4">
                  <MinusCircleIcon />
                </button>
                <div className="border-l-4 pl-4 py-4">
                  {setting.listof == "object" ? (
                    (setting.listSchema || []).map((subField, idx) => {
                      return (
                        <SettingElement
                          key={`${setting.name}.${i}.${subField.name}`}
                          valueAtLoad={subValue[subField.name] || []}
                          setting={subField}
                          suggestField={suggestField}
                          keypath={[...keypath, i, subField.name]}
                          previewField={previewField}
                          existingDynamicThemes={existingDynamicThemes}
                          adventureId={adventureId as string}
                          updateFn={(subFieldName: string, value: any) => {
                            updateItem({
                              index: i,
                              subField: subFieldName,
                              value: value,
                            });
                          }}
                          isUserApproved={isUserApproved}
                          isApprovalRequested={isApprovalRequested}
                          latestAgentVersion={latestAgentVersion}
                        />
                      );
                    })
                  ) : (
                    <SettingElement
                      key={`${setting.name}.${i}._`}
                      valueAtLoad={subValue || null}
                      adventureId={adventureId as string}
                      existingDynamicThemes={existingDynamicThemes}
                      setting={{
                        ...setting,
                        type: setting.listof as any,
                      }}
                      suggestField={suggestField}
                      keypath={[...keypath, i]}
                      previewField={previewField}
                      inlined={true}
                      updateFn={(_: any, value: any) => {
                        updateItem({ index: i, value: value });
                      }}
                      isUserApproved={isUserApproved}
                      isApprovalRequested={isApprovalRequested}
                      latestAgentVersion={latestAgentVersion}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <button onClick={addToList} className="flex flex-row items-center mt-4">
          <PlusCircleIcon /> &nbsp; Add New
        </button>
      </div>
    );
  }

  const hasValidationErrors = validationErrors && validationErrors.length > 0;
  let variablesPermitted = Object.entries(setting?.variablesPermitted || {});
  variablesPermitted = variablesPermitted.sort(
    (a: [string, string], b: [string, string]) => {
      return a[0].localeCompare(b[0], undefined, { numeric: true });
    }
  );

  return (
    <div className="flex flex-col gap-2" id={setting.name}>
      {!inlined && setting.type != "divider" && (
        <TypographyLead className="space-y-6">{setting.label}</TypographyLead>
      )}
      {!inlined && setting.unused && (
        <Alert className="my-2 border-red-200">
          <AlertTriangleIcon className="h-4 w-4 mt-2" />
          <AlertTitle className="text-lg">Coming Soon</AlertTitle>
          <AlertDescription>
            This setting isn&apos;t yet wired in to gameplay.
          </AlertDescription>
        </Alert>
      )}
      {!inlined &&
        !isDisabled &&
        setting.type != "divider" &&
        setting.description && (
          <div className="text-sm text-muted-foreground mb-2">
            {setting.description}
          </div>
        )}{" "}
      {(imagePreview || imagePreviewBlock || imagePreviewLoading) && (
        <ImagePreview url={imagePreview} block={imagePreviewBlock} />
      )}
      {variablesPermitted.length > 0 && (
        <div className="">
          <TypographyMuted>Prompt Variables Supported:</TypographyMuted>
          <ul className="ml-2">
            {variablesPermitted.map(([key, value]) => {
              return (
                <li key={key}>
                  <TypographyMuted>
                    <b>&#123;{key}&#125;</b>: {value}
                  </TypographyMuted>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {setting.requiresApproval && !isUserApproved && isApprovalRequested && (
        <div className="w-full bg-background/90 z-20 p-4 border border-yellow-600 rounded-md relative overflow-hidden">
          <div className="w-full flex flex-col items-center justify-center">
            <TypographyLarge>Status: In Review</TypographyLarge>
            <TypographyP>
              Our team will review your game and then release it to the public
              directory.
            </TypographyP>
            <TypographyP>
              Reach out on{" "}
              <a
                href="https://steamship.com/discord"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Discord
              </a>{" "}
              if you have questions!
            </TypographyP>
          </div>
        </div>
      )}
      {isDisabled ? (
        <div className="w-full bg-background/90 z-20 p-4 border border-yellow-600 rounded-md relative overflow-hidden">
          <div className="w-full flex flex-col items-center justify-center">
            <TypographyLarge>
              {setting.requiredText || "This setting requires approval."}
            </TypographyLarge>
            <TypographyLead>
              You can still share your published game with your friends using{" "}
              <a
                target="_blank"
                className="text-blue-600 hover:underline"
                href={`${process.env.NEXT_PUBLIC_WEB_BASE_URL}/adventures/${adventureId}`}
              >
                this link
              </a>
              .
            </TypographyLead>
            <TypographyLead>
              Reach out on{" "}
              <a
                href="https://steamship.com/discord"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Discord
              </a>{" "}
              to be approved.
            </TypographyLead>
          </div>
        </div>
      ) : (
        <div>{innerField}</div>
      )}
      {setting.previewOutputType && (
        <div>
          <Button
            variant="default"
            onClick={preview}
            isLoading={imagePreviewLoading}
          >
            Preview
          </Button>
        </div>
      )}
      {setting.suggestOutputType && (
        <div>
          <Button variant="default" onClick={suggest} disabled={suggesting}>
            {suggesting ? <Loader2 className="animate-spin" /> : "Suggest"}
          </Button>
        </div>
      )}
      {hasValidationErrors && (
        <div className="text-sm bg-red-300 border-2 border-red-700 text-black p-2">
          <ul>
            {validationErrors.map((validationError: string) => {
              return <li key={validationError}>{validationError}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
