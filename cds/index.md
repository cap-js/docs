---
section: CDS
# shorty: CDS
permalink: /cds/
# status: released
---

# Core Data Services (CDS)
Language Reference Documentation
{ .subtitle}

CDS is the backbone of the SAP Cloud Application Programming Model (CAP). It provides the means to declaratively capture service definitions and data models, queries, and expressions in plain (JavaScript) object notations. CDS features to parse from a variety of source languages and to compile them into various target languages.

<!-- % capture assets %}{{site.baseurl}}/{{page.path}}/../assets% endcapture %} -->

<img src="./assets/csn.drawio.svg" class="adapt"/>

CDS models are plain JavaScript objects complying to the _[Core Schema Notation (CSN)][CSN]_, an open specification derived from [JSON Schema]. You can easily create or interpret these models, which foster extensions by 3rd-party contributions. Models are processed dynamically at runtime and can also be created dynamically. % if jekyll.environment != "external" %}See [The Nature of Models](models) for more details.% endif %}

<br>

% include _chapters synopsis=1 %}
