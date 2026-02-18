$(document).foundation()
// src: https://github.com/space10-community/conversational-form
var cfInit = function () {
    $(document.getElementById("cof-form")).conversationalForm({
        formEl: document.getElementById("cof-form"),
        context: document.getElementById("cof-context"),
        dictionaryData: {
            "entry-not-found": "Nessun dato trovato, riprova!",
            "input-placeholder": "Clicca qui per scrivere",
            "input-placeholder-required": "Devi rispondermi per andare avanti...",
            "input-no-filter": "Sembra esserci un errore: <strong>{input-value}</strong>",
            "user-reponse-and": " e ",
            "user-reponse-missing": "Sembra che tu non abbia risposto...",
            "general": "Scrivici..."
        }, // empty will throw error
        submitCallback: function () {

            var formDataSerialized = this.getFormData(true);


            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: 'https://hooks.zapier.com/hooks/catch/451636/rseq51/', // the url where we want to POST
                data: formDataSerialized, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true
            })

            this.addRobotChatResponse("Hai richiesto il tuo sopralluogo gratuito, ti contatteremo per fissare una data prima possibile!");

            ga('send', 'event', {
                eventCategory: 'contatto',
                eventAction: 'form',
                eventLabel: 'richiesta-effettuata'
            });
        }
    });
}
var scrollHandler = function () {
    var hT = $('#scroll-to').offset().top,
        hH = $('#scroll-to').outerHeight(),
        wH = $(window).height(),
        wS = $(this).scrollTop();
    //console.log((hT - wH), wS);
    if (wS > (hT - wH)) {
        cfInit();
        $(window).off('scroll', scrollHandler);
    }
};
$(document).ready(function () {
    if ($(window).width() < 1024) {
        $(window).scroll(scrollHandler);
    } else {
        cfInit();
    }
});
