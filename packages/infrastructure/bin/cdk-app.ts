#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MusicAppCdkStack } from "../lib/stacks/music-app-cdk-stack";

const app = new cdk.App();
new MusicAppCdkStack(app, "MusicAppCdkStack", {
  env: { region: "us-east-1" },
});
