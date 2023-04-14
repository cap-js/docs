 ### Annotating Entity Elements

1.  Place cursor in the `annotate` directive, for example `annotate Foo.Bar with {|};`, add a new line and trigger the code completion. You get the list of entity elements. Choose the one you want to annotate.

#### Sample Code

 ```
        annotate Foo.Bar with {
            code|
        };

```

2.  Choose <kbd class="space">⎵</kbd> key and use the code completion again and choose `{} UI`. Micro-snippet `@UI : {|}` is inserted:

#### Sample Code

 ```
        annotate Foo.Bar with {
            code @UI : { | }
        };

 ```

3.  Trigger completion again and choose an annotation term from UI vocabulary, in this example: **Hidden**.

#### Sample Code

 ```
        annotate Foo.Bar with {
            code @UI : {Hidden : |}
        };
 ```

4.  Choose the **Tab** key to move the cursor to the next tab stop and use the code completion again to add the value. As `UI.Hidden` annotation is of Boolean type, the values true and false is suggested:

#### Sample Code\
```
        annotate Foo.Bar with {
            code @UI : {Hidden : false }
        };

 ```

