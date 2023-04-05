---
synopsis: >
  This is about providing localized versions of your models, for example, the OData models served to Fiori UIs.
---

# Localized Data
<!--UNDER CONSTRUCTION - WK

put the focus on the end user view

--->

{% include _toc levels="2" %}



This document describes some thoughts on Localized Data in the CAP programming model.

The general idea is to store texts for all instances of certain (business) entities in multiple languages.
Classically SAP solves this with a pair of a text-independent main table and a corresponding text table which is a classical normalized data approach. The data then is always retrieved via a view containing the main table and the text table.


To avoid performance overhead we propose a new idea with a de-normalized entity-text-relation.

To this end, we put the default language into the main entity and keep a the secondary text entity only for additional languages.

## Example – Costcenter with de-normalized default text

 
```sh
entity Costcenter {

      key  costcenterId         : Integer;
           personResponsible    : String(120);         
           languageId           : String(5);
           description          : String(20);
           longText             : String(120); 
           _Localized_Text      : Association to CostCenter_Text
             on   _Localized_Text.costcenterId = costcenterId
             and  _Localized_Text.languageId   = $lang ;

};
```

Here we have introduced the association _Localized_Text to the corresponding language dependent text entity.
Furthermore the tuple (languageId, description, longText) denotes the language-dependent part for the default language.

```sh
entity Costcenter_Text {

      key  costcenterId     : Integer;
      key  languageId       : String(5);
           description      : String(20);
           longText         : String(120); 

};
```
 
## View Building
Now we want to build a view on top of these two entities to mix-in the language dependent parts properly.


This could be done most directly with the following view:

```sh
view Costcenter_Text_View as       
    select from CostCenter
       {  costcenterId,
          personResponsible,     
          languageId,
          description,
          longText,               
          _Localized_Text.languageId   as  _localized_languageId,
          _Localized_Text.description  as  _localized_description,
          _Localized_Text.longText     as  _localized_longText
       };     
```

This view shows default text (from the main entity) and localized texts (from the text entity) in parallel.

Now we can apply two different strategies

First, keep the view on this level and do the rest of the work (fetching the correct non-empty text from the two alternatives) either in the OData framework of Gateway / Connected Cores or on the Fiori pattern UI.

Second, apply a second view on top to calculate the "correct" text on the DB.



## Advantages/Disadvantages of the two strategies


```sh
First approach (mix-in on the client)
(Plus)   Performance, mix-in of languages is only done in chunks on demand.
(Minus)  Additional work in the Fiori Patterns or the OData Framework.

Second approach (mix-in on the DB / in CDS)
(Plus)   Everything can be done on the CDS level without further changes
         in the dependent frameworks like Fiori or CoCo.
(Minus)  Performance, mix-in of languages is done always for all records on the DB. 

```

(Symbolical) result set of view CostCenter_Text_View

 

 

 ```sh
  
costcenterId  personResponsible  languageId  description  longText       _localized   _localized    _localized
                                                                          _languageId  _description  _longText

1             Tim                en          en 1         en 1 long       de          de 1          de 1 lang
2             Struppi            en          en 2         en 2 long       de          de 3          de 2 lang
3             Tintin             en          en 3         en 3 long       de          de 3          de 3 lang
4             Milou              en          en 4         en 4 long       de          de 4          de 4 lang
5             Haddock            en          en 5         en 5 long       de          de 5          de 5 lang
6             C6                 en          en 6         en 6 long       de          de 6          de 6 lang
7             C7                 en          en 7         en 7 long       de          de 7          de 7 lang
...  
900           C900               en          en 900       en 900 long     de          de 900        de 900 lang
901           C901               en          en 901       en 901 long     null        null          null
902           C902               en          en 901       en 902 long     null        null          null

```

When you build a UNION ALL view on top in the backend like

```sh
view CostCenter_Text_Union_View as
  (  select from CostCenter
       {  costcenterId,
          personResponsible,         
          _Localized_Text.languageId,
          _Localized_Text.description,
          _Localized_Text.longText
       } where _Localized_Text.languageId is not null
  )
      union all
  (  select from CostCenter
       {  costcenterId,
          personResponsible,
          languageId,
          description,
          longText
       } where costcenterId in ( select from Costcenter { costcenterId } where _Localized_Text.languageId is null
   )
);    
```


then the result set is condensed and it looks like
 


```sh
  
costcenterId  personResponsible  languageId  description  longText   

 1             Tim                de          de 1          de 1 lang
 2             Struppi            de          de 3          de 2 lang 
 3             Tintin             de          de 3          de 3 lang
 4             Milou              de          de 4          de 4 lang
 5             Haddock            de          de 5          de 5 lang
 6             C6                 de          de 6          de 6 lang
 7             C7                 de          de 7          de 7 lang
 ...  
 900           C900               de          de 900        de 900 lang 
 901           C901               en          en 901        en 901 long    
 902           C902               en          en 901        en 902 long   
  
```


Records   1-900 with Text in Logon Language   (de)

Records 901-902 with Text in Default Language (en)

 

## Fuzzy Search

Both variants, the "simple" view and the UNION ALL view support fuzzy search using the (HANA) SQL keywords contains and fuzzy.

(This was not the case with our first try using views containing expressions with the coalesce statement. These views did not support fuzzy search and are ruled out therefore.)

 

## Open Point – Representation of language codes

We have to make sure that Logon Language $lang is available for definition and consumption.

So we have to clarify which ISO
code should be used for field like LANGUAGE_ID.

In S/4 we have on DB level the old
"LOCALE_SAP" with one character like 'E', 'D' etc. and then some input / output
conversion to 'EN', 'DE' etc.

On HANA we have so far the session
context variables

session_context('LOCALE_SAP') contains values like 'E', 'D' etc.

session_context('LOCALE') contains values like 'en_US' etc.

So we have to come up with an standardized
format how languages should be handled on the DB (in the key fields of the text
tables) and how they are available in system variables like $lang and $defaultLang

Proposal: One possibility would be to create a standard entity Language –
similar to the classical table T002 in the classical ABAP systems - which
contains all SAP supported languages in a standardized format. And all
language-dependent entities should associate this entity Language for the
language key field to guarantee unified usage of language codes. This standard
language entity should contain language codes as described in

{{cap}}/Cookbook/40-Localization/#default-language

 

## Normalized Language IDs

To reduce the number of translated text bundles to focus on and to
simplify bundle lookups at runtime, Incoming locales, e.g. from Accept-Language headers, are narrowed to their ISO-639-1 language codes, with their
region or script designators stripped off.

For example, en_US, en_CA, en_AU would all be narrowed to the language ID en to lookup bundles and localized models, with the exception of these
white listed language+region descriptors which are used as is as language IDs:



```sh  

Locale            Language

zh_CN             Chinese - China
zh_HK             Chinese - Hong Kong, China
zh_TW             Chinese traditional - Taiwan, China
en_GB             English - English
fr_CA             French - Canada
pt_PT             Portuguese - Portugal
es_CO             Spanish - Colombia
es_MX             Spanish - Mexico
  
```


 

## Proposal for future extended CDS syntax

The example mentioned above is - beside the usage of the system parameter $lang – is written in actually existing CDS syntax.

But we could think of a unified syntax for Localized Data in CDS to guarantee that all localized entities are built in the same way easily.


```sh
entity Costcenter {

    key  costcenterId        : Integer;
         personResponsible   : String(120);
         description         : localized String(20);
         longText            : localized String(120); 

};
```



This new syntax including the new CDS key word localized represents a short notation for the conglomerate of entity Costcenter, the text carrying entity Costcenter_Text and the corresponding localized default text view Costcenter_Text_View

That means the logic described above with help of the two entities and the corresponding text view should be created automatically in the background when an entity is defined in the new way using the new keyword localized.
 

## Benefits of new syntax

You could still build your
applications and language dependent CDS entities using the classical CDS
syntax. But besides have a guarantee for uniformity the new syntax brings
another big benefit.

The conglomerate of three design
time artifacts is reduced to one design time artifact for one language
dependent business entity. Especially when your application includes many ("n")
of those entities the difference between n and 3n on the object level and
especially on the association level becomes striking. With the new syntax you
simply can take care for the business associations between the business
entities and on none of the higher levels for view building or OData
consumption you have to take care for the text associations when your model is
built on top of the new "localized" entities.

## Proposal for temporary implementation without the keyword localized

We have defined the entity Costcenter by using the new keyword
localized

```sh
context CostCenter_Management {
  entity Costcenter {
     key   costcenterId       : Integer;
           personResponsible  : String(120);
           languageId         : localized String(5);
           description        : localized String(20);
           longText           : localized String(120); 
  };
};
```
 

To achieve the same overall
behavior as long as the keyword localized is
not implemented in all layers, the preliminary entity in
the original context should look like


```sh
context CostCenter_Management {
  entity CostCenter { 
     key  costcenterId        : Integer;
          personResponsible   : String(120);
          languageId          : String(5);
          description         : String(20);
          longText            : String(120); 
          _Localized_Text     : Association to _Localized.Costcenter_Text
             on   _Localized_Text.costcenterId = costcenterId
             and  _Localized_Text. languageId  = $lang ;
   };     
};
```


There will be additional artifacts
in a central context called _Localized.

In the first run, these artifacts
have to be added manually. When the
keyword localized is
fully available they will be generated.


```sh
context _Localized {
  entity CostCenter_Text {
    key  costcenterId      : Integer;
    key  languageId        : String(5);
         description       : String(20);
         longText          : String(120);
  };

view CostCenter as 
select from CostCenter_Management.CostCenter
       {  costcenterId,
          personResponsible,
          languageId,
          description,
          longText,
          _Localized_Text.languageId   as  _localized_languageId,
          _Localized_Text.description  as  _localized_description,
          _Localized_Text.longText     as  _localized_longText
       };
};
```
 
So, the entity Costcenter will be internally represented by a view in the context _Localized containing all elements from the base entity and from the text entity.

## Insert, Update and Delete on Localized Entities

We have to take into account how
insert, update and delete statements on the localized entities could be handled
in an elegant way.

To be able to work with this
entities / views we have to have a mechanism to perform insert, update and
delete statements (automatically) in a meaningful way.

So, using the logon language $lang -  we have to define how these operations could be performed unambiguously.

### Insert

An Insert on

```sh

  entity Costcenter {
     key   costcenterId       : Integer;
           personResponsible  : String(120);
           description        : localized String(20);
           longText           : localized String(120); 
  };
  
```

like (symbolically written)


```sh
Insert Costcenter { costcenterId      = 1001,
                    personResponsible = ‘Jane Doe’,
                    description       = ‘Description 1001’,
                    longText          = ‘Description 1001 long’
                  };
```

has to be performed on the persistency layer as:

 
```sh
Insert Costcenter_BaseTable { costcenterId      = 1001,
                              personResponsible = ‘Jane Doe’,
                              languageId        = $lang,
                              description       = ‘Description 1001’,
                              longText          = ‘Description 1001 long’ };
```

where $lang denotes the actual logon language.

The Insert is performed on the base table / base entity only.
The first language added at the  Insert statement will be the default language for this record.

Here Costcenter_BaseTable denotes the base DB table on the persistency layer of the entity Costcenter.

### Update

A (symbolically written)  Update like

```sh
Update Costcenter set { personResponsible = ‘John Doe’,
                        description       = ‘new description’,
                        longText          = ‘new long text’ }
                  where costcenterId = 1001
```
will have to be performed on the persistency layer as:

 
```sh
Update Costcenter_BaseTable set personResponsible = ‘John Doe’
                            where costcenterId = 1001;

Upsert Costcenter_TextTable set { description = ‘new description’,
                                  longText    = ‘new long text’ }    
                            where costcenterId = 1001 and languageId = $lang ;
```
here $lang denotes the actual logon language.

Note that the second statement contains the keyword Upsert to be able to maintain texts in languages different than the default language. If the text already exists in a certain logon language it will be updated, otherwise a new record will be inserted.

Costcenter_TextTable denotes the DB text table on the persistency layer of the entity Costcenter.

 

### Delete

A (symbolically written)  Delete like

```sh
Delete Costcenter where costcenterId = 1001 ;
```

will have to be performed as the the two (symbolically written) statements on the persistency layer:

 
```sh
Delete CostCenter_BaseTable where costcenterId = 1001;

Delete CostCenter_TextTable where costcenterId = 1001;
```

(Here all texts will be deleted which is semantically correct when the Costcenter itself vanishes.)

 

## Entity represented as Updatable View

So, using these prescriptions for insert,
update and delete the entity Costcenter will technically be represented by an "updatable" view with the same name.

Especially when defining OData services on top of the CDS entity / CDS updatable view the prescriptions for Insert, Update, Delete have to be incorporated automatically.

 

 
