(function($) {
    let newSectionForm = $("#new-section-form"),
    errorList = $("#errors");

    $(newSectionForm).submit(function(event) {
        let errors = [];
        let title = $("#title").val();
        try {
            title = checkString(title, "title");
        } catch(e) {
            errors.push(e);
        }
        if (errors.length > 0) {
            event.preventDefault();
            errorList.empty();
            for (let i in errors) {
                errorList.append("<li>" + errors[i] + "</li>");
            }
            errorList.show();
        }
    });

    function checkString(string, val) {
        if (!string) throw "The " + val + " was not provided.";
        if (typeof string !== 'string') throw "The " + val + " is not a string.";
        string = string.trim();
        if (string.length === 0) throw "The " + val + " cannot be empty.";
        return string;
    };

})(window.jQuery);