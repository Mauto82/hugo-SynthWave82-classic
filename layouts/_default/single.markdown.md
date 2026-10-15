# {{ .Title }}

{{ with .Params.summary | default .Description }}> {{ . | plainify | htmlUnescape }}

{{ end -}}
- URL: {{ .Permalink }}
- {{ i18n "language" }}: {{ .Language.Lang }}
{{- if not .Date.IsZero }}
- {{ i18n "published" }}: {{ .Date.Format "2006-01-02" }}
{{- end }}
{{- if and (not .Lastmod.IsZero) (ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02")) }}
- {{ i18n "updated" }}: {{ .Lastmod.Format "2006-01-02" }}
{{- end }}
{{- with .Params.author }}
- {{ i18n "author" }}: {{ . }}
{{- end }}
{{- with index .Params (partial "func/category-taxonomy.html" .) }}
- {{ i18n "categories" }}: {{ delimit . ", " }}
{{- end }}
{{- with .Params.tags }}
- Tags: {{ delimit . ", " }}
{{- end }}
{{- with .Params.tutorial }}
- {{ i18n "guide" }}: {{ . }}{{ with $.Params.tutorialId }} ({{ i18n "part" }} {{ . }}){{ end }}
{{- end }}
{{- range .Translations }}
- {{ i18n "translation" }} ({{ .Language.Lang }}): {{ .Permalink }}
{{- end }}

---

{{ .RawContent }}
