// tools/cds-lint/rules.data.ts
import * as fs from "fs";
import * as path from "path";
var __vite_injected_original_dirname = "/Users/patricebender/SAPDevelop/docs/tools/cds-lint";
var rules_data_default = {
  async load() {
    const data = { "Model Validation": [], "Environment": [] };
    let plugin;
    try {
      plugin = await import("@sap/eslint-plugin-cds");
    } catch (e) {
      return data;
    }
    const allRules = Object.keys(plugin?.configs.all.rules).sort();
    allRules.forEach((rule) => {
      rule = rule.replace("@sap/cds/", "");
      if (rule !== "min-node-version") {
        const description = plugin?.rules[rule]?.meta.docs.description;
        const ruleDocs = path.join(__vite_injected_original_dirname, `meta/${rule}.md`);
        const hasRuleDocs = fs.existsSync(ruleDocs);
        const url = hasRuleDocs ? `./meta/${rule}` : null;
        const isRecommended = plugin?.rules[rule]?.meta.docs.recommended ? "\u2705" : "";
        const hasFix = plugin?.rules[rule]?.meta.fixable ? "\u{1F527}" : "";
        const hasSuggestions = plugin?.rules[rule]?.meta.hasSuggestions ? "\u{1F4A1}" : "";
        const model = plugin?.rules[rule]?.meta?.model === "parsed" ? "\u{1F440}" : "";
        const category = plugin?.rules[rule]?.meta?.model === "none" ? "Environment" : "Model Validation";
        data[category].push({ rule, description, url, isRecommended, hasFix, hasSuggestions, model });
      }
    });
    return data;
  }
};
export {
  rules_data_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidG9vbHMvY2RzLWxpbnQvcnVsZXMuZGF0YS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9wYXRyaWNlYmVuZGVyL1NBUERldmVsb3AvZG9jcy90b29scy9jZHMtbGludFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3BhdHJpY2ViZW5kZXIvU0FQRGV2ZWxvcC9kb2NzL3Rvb2xzL2Nkcy1saW50L3J1bGVzLmRhdGEudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3BhdHJpY2ViZW5kZXIvU0FQRGV2ZWxvcC9kb2NzL3Rvb2xzL2Nkcy1saW50L3J1bGVzLmRhdGEudHNcIjtpbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhc3luYyBsb2FkKCkge1xuICAgIGNvbnN0IGRhdGE6IGFueSA9IHsgXCJNb2RlbCBWYWxpZGF0aW9uXCI6IFtdLCBcIkVudmlyb25tZW50XCI6IFtdIH07XG4gICAgbGV0IHBsdWdpbjogYW55O1xuICAgIHRyeSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHBsdWdpbiA9IGF3YWl0IGltcG9ydCgnQHNhcC9lc2xpbnQtcGx1Z2luLWNkcycpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgfVxuICAgICAgY29uc3QgYWxsUnVsZXMgPSBPYmplY3Qua2V5cyhwbHVnaW4/LmNvbmZpZ3MuYWxsLnJ1bGVzKS5zb3J0KCk7XG5cbiAgICAgIGFsbFJ1bGVzLmZvckVhY2goKHJ1bGU6IHN0cmluZykgPT4ge1xuICAgICAgICBydWxlID0gcnVsZS5yZXBsYWNlKCdAc2FwL2Nkcy8nLCAnJyk7XG4gICAgICAgIC8vIFRPRE86IFNraXAgdGhlIG1pbi1ub2RlLXZlcnNpb24gcnVsZSBhcyBpdCB3aWxsIGJlIGRlcHJlY2F0ZWQgc29vblxuICAgICAgICBpZiAocnVsZSAhPT0gJ21pbi1ub2RlLXZlcnNpb24nKSB7XG4gICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBwbHVnaW4/LnJ1bGVzW3J1bGVdPy5tZXRhLmRvY3MuZGVzY3JpcHRpb247XG4gICAgICAgICAgY29uc3QgcnVsZURvY3MgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBgbWV0YS8ke3J1bGV9Lm1kYClcbiAgICAgICAgICBjb25zdCBoYXNSdWxlRG9jcyA9IGZzLmV4aXN0c1N5bmMocnVsZURvY3MpXG4gICAgICAgICAgY29uc3QgdXJsID0gaGFzUnVsZURvY3MgPyBgLi9tZXRhLyR7cnVsZX1gIDogbnVsbFxuICAgICAgICAgIGNvbnN0IGlzUmVjb21tZW5kZWQgPSBwbHVnaW4/LnJ1bGVzW3J1bGVdPy5tZXRhLmRvY3MucmVjb21tZW5kZWQgPyAnXHUyNzA1JyA6ICcnO1xuICAgICAgICAgIGNvbnN0IGhhc0ZpeCA9IHBsdWdpbj8ucnVsZXNbcnVsZV0/Lm1ldGEuZml4YWJsZSA/ICdcdUQ4M0RcdUREMjcnIDogJyc7XG4gICAgICAgICAgY29uc3QgaGFzU3VnZ2VzdGlvbnMgPSBwbHVnaW4/LnJ1bGVzW3J1bGVdPy5tZXRhLmhhc1N1Z2dlc3Rpb25zID8gJ1x1RDgzRFx1RENBMScgOiAnJztcbiAgICAgICAgICBjb25zdCBtb2RlbCA9IHBsdWdpbj8ucnVsZXNbcnVsZV0/Lm1ldGE/Lm1vZGVsID09PSAncGFyc2VkJyA/ICdcdUQ4M0RcdURDNDAnIDogJyc7XG4gICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBwbHVnaW4/LnJ1bGVzW3J1bGVdPy5tZXRhPy5tb2RlbCA9PT0gJ25vbmUnID8gXCJFbnZpcm9ubWVudFwiIDogXCJNb2RlbCBWYWxpZGF0aW9uXCI7XG4gICAgICAgICAgZGF0YVtjYXRlZ29yeV0ucHVzaCh7IHJ1bGUsIGRlc2NyaXB0aW9uLCB1cmwsIGlzUmVjb21tZW5kZWQsIGhhc0ZpeCwgaGFzU3VnZ2VzdGlvbnMsIG1vZGVsIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlVLFlBQVksUUFBUTtBQUM3VixZQUFZLFVBQVU7QUFEdEIsSUFBTSxtQ0FBbUM7QUFHekMsSUFBTyxxQkFBUTtBQUFBLEVBQ2IsTUFBTSxPQUFPO0FBQ1gsVUFBTSxPQUFZLEVBQUUsb0JBQW9CLENBQUMsR0FBRyxlQUFlLENBQUMsRUFBRTtBQUM5RCxRQUFJO0FBQ0osUUFBSTtBQUVBLGVBQVMsTUFBTSxPQUFPLHdCQUF3QjtBQUFBLElBQ2hELFNBQVMsR0FBRztBQUNWLGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxXQUFXLE9BQU8sS0FBSyxRQUFRLFFBQVEsSUFBSSxLQUFLLEVBQUUsS0FBSztBQUU3RCxhQUFTLFFBQVEsQ0FBQyxTQUFpQjtBQUNqQyxhQUFPLEtBQUssUUFBUSxhQUFhLEVBQUU7QUFFbkMsVUFBSSxTQUFTLG9CQUFvQjtBQUMvQixjQUFNLGNBQWMsUUFBUSxNQUFNLElBQUksR0FBRyxLQUFLLEtBQUs7QUFDbkQsY0FBTSxXQUFnQixVQUFLLGtDQUFXLFFBQVEsSUFBSSxLQUFLO0FBQ3ZELGNBQU0sY0FBaUIsY0FBVyxRQUFRO0FBQzFDLGNBQU0sTUFBTSxjQUFjLFVBQVUsSUFBSSxLQUFLO0FBQzdDLGNBQU0sZ0JBQWdCLFFBQVEsTUFBTSxJQUFJLEdBQUcsS0FBSyxLQUFLLGNBQWMsV0FBTTtBQUN6RSxjQUFNLFNBQVMsUUFBUSxNQUFNLElBQUksR0FBRyxLQUFLLFVBQVUsY0FBTztBQUMxRCxjQUFNLGlCQUFpQixRQUFRLE1BQU0sSUFBSSxHQUFHLEtBQUssaUJBQWlCLGNBQU87QUFDekUsY0FBTSxRQUFRLFFBQVEsTUFBTSxJQUFJLEdBQUcsTUFBTSxVQUFVLFdBQVcsY0FBTztBQUNyRSxjQUFNLFdBQVcsUUFBUSxNQUFNLElBQUksR0FBRyxNQUFNLFVBQVUsU0FBUyxnQkFBZ0I7QUFDL0UsYUFBSyxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxLQUFLLGVBQWUsUUFBUSxnQkFBZ0IsTUFBTSxDQUFDO0FBQUEsTUFDOUY7QUFBQSxJQUNGLENBQUM7QUFDSCxXQUFPO0FBQUEsRUFDVDtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
