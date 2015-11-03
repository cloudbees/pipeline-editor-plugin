Behaviour.specify("INPUT.pipeline-editor", 'pipeline-editor-button', 0, function(e) {
        makeButton(e,function(_) {
            var script = e.next("input");
            var json = script.next("input");

            alert("foo");

            var pageBody = $('page-body');
            var row = pageBody.down(".row");

            row.style.display = "none";

            var canvas = document.createElement('div');
            pageBody.appendChild(canvas);
            canvas.innerHtml = "<b>pipeline-editor</b>"

            // TODO: Michael to fill in the code that expands the DIV section to the full size

            // at the end of the day
            script.value = "...";
            json.value = "...";
        });
});