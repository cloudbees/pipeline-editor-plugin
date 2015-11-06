Behaviour.specify("INPUT.pipeline-editor", 'pipeline-editor-button', 0, function(e) {
        var script = e.next("input");
        var json = script.next("input");

        makeButton(e,function(_) {
            var pageBody = $('page-body');
            var row = pageBody.down(".row");

            row.style.display = "none";

            pageBody.insert({bottom:"<div class=pipeline-editor style='padding:3em'><b>pipeline-editor</b><input type=button name=accept value=Accept></div>"});

            var canvas = pageBody.down("> .pipeline-editor");
            var accept = canvas.down("> INPUT");

            makeButton(accept,function(_){
                // update fhe form values
                script.value = "...";
                json.value = "...";

                // kill the dialog
                canvas.remove();
                row.style.display = "block";
            });
        });
});