"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setBlueprint } from "@/lib/store/blueprint/blueprintSlice";
import type { BlueprintPayload } from "@/lib/store/blueprint/blueprintType";

type BusinessBlueprint = BlueprintPayload | { payload: BlueprintPayload };

interface BusinessBlueprintDataInitialiserProps {
  businessBlueprint: BusinessBlueprint;
}

export default function BusinessBlueprintDataInitialiser({
  businessBlueprint,
}: BusinessBlueprintDataInitialiserProps) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && businessBlueprint) {
      const payload = 'payload' in businessBlueprint
        ? businessBlueprint.payload
        : businessBlueprint;
      dispatch(setBlueprint(payload));
      initialized.current = true;
    }
  }, [businessBlueprint, dispatch]);

  return null;
}
