import { Config } from "@remotion/cli/config";
import { cpus } from "node:os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(Math.max(1, Math.min(4, cpus().length)));
