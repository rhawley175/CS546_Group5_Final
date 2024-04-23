(function($) {
    let newSectionForm = $("#new-section-form");
    let errorList = $("#errors"); 

    function checkString(input, type) {
        if (!input) throw `Please provide a ${type}.`;
        input = input.trim();
        if (input.length === 0) throw `The ${type} cannot be empty.`;
        return input;
    }

    $(newSectionForm).submit(function(event) {
        event.preventDefault(); 
        let errors = [];
        let journalId = $("#journalId").val();
        let title = $("#title").val();

        try {
            journalId = checkString(journalId, "journal ID");
        } catch (e) {
            errors.push(e);
        }

        try {
            title = checkString(title, "title");
        } catch (e) {
            errors.push(e);
        }

        if (errors.length > 0) {
            errorList.empty();
            for (let error of errors) {
                errorList.append(`<li>${error}</li>`);
            }
            errorList.show();
        } else {
            errorList.hide();
            this.submit();
        }
    });

})(window.jQuery);