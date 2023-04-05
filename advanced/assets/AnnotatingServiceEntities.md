### Annotating Service Entities

\(cursor position indicated by `|`\)

1.  Place cursor in the `annotate` directive for a service entity, for example `annotate Foo.Bar with ;` and trigger the code completion.
2.  Type `u` to filter the suggestions and choose `{} UI`. Micro-snippet `@UI : {|}` is inserted: `annotate Foo.Bar with @UI : {|};`
3.  Use the code completion again to add an annotation term from UI vocabulary, in this example `SelectionFields`. Micro snippet for this annotation is added and the cursor is placed right after the term name letting you define a qualifier: `annotate Foo.Bar with @UI : {SelectionFields : [|]};`
4.  Press the **Tab** key to move the cursor to the next tab stop and use the code completion again to add values. As `UI.SelectionFields` annotation is a collection of entity elements \(entity properties\), all elements of the annotated entity are suggested.

*Note:* To choose an element of an associated entity, first select the corresponding association from the list and type *. \(period\)*. Elements of associated entity are suggested.

*Note:* You can add multiple values separated by comma.

#### Sample Code


 ```
        annotate Foo.Bar with @UI : { SelectionFields : [
            description, assignedIndividual.lastName|
            ]
         };
    ```
   ```

5.  Add `, (comma)` after collection brackets **\[\]** and use the code completion again to add another annotation from UI vocabulary, such as `LineItem`. Line item is a collection of DataField records. To add a record, select the record type you need from the completion list.


#### Sample Code

 ```
        annotate Foo.Bar with @UI : { SelectionFields : [
            description, assignedIndividual.lastName
            ],
            LineItem : [
                {
                    $Type:'UI.DataField',
                    Value : |,
                },
                ]

         };

  ```
*Note:* For each record type, two kinds of micro-snippets are provided: one containing only mandatory properties and one containing all properties defined for this record \(full record\). Usually you need just a subset of properties. So, you either select a full record and then remove the properties you don’t need, or add the record containing only required properties and then add the remaining properties.

6.  Use code completion to add values for the annotation properties.

#### Sample Code

 ```
        annotate Foo.Bar with @UI : { SelectionFields : [
            description, assignedIndividual.lastName
            ],
            LineItem : [
                {
                    $Type:'UI.DataField',
                    Value : description,
                },
                {
                    $Type:'UI.DataFieldForAnnotation',
                    Target :  'assignedIndividual/@Communication.Contact',
                },|
              ]
               };

        ```
    ```

*Note:* To add values pointing to annotations defined in another CDS source, you must reference this source with \`using\` directive.
For more information, see [The 'using' Directive](../cds/cdl#using).

