document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const fields = ['contactName', 'contactEmail', 'contactPhone', 'contactSubject', 'contactMessage'];
        const groupMap = {
            contactName: 'group-name',
            contactEmail: 'group-email',
            contactPhone: 'group-phone',
            contactSubject: 'group-subject',
            contactMessage: 'group-message'
        };

        const validateField = (id) => {
            const val = document.getElementById(id).value.trim();
            let valid = true;
            if (id === 'contactName') valid = val.length >= 3;
            if (id === 'contactEmail') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            if (id === 'contactPhone') valid = val.replace(/\D/g, '').length >= 10;
            if (id === 'contactSubject') valid = val !== '';
            if (id === 'contactMessage') valid = val.length >= 15;
            document.getElementById(groupMap[id]).classList.toggle('invalid', !valid);
            return valid;
        };

        fields.forEach(id => document.getElementById(id).addEventListener('input', () => validateField(id)));

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            if (fields.map(validateField).every(Boolean)) {
                document.getElementById('contactSuccessBanner').style.display = 'block';
                UI.toast('✓ Formulario enviado correctamente');
                contactForm.reset();
            }
        });
    }

    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        const qFields = ['quoteClientName', 'quoteClientEmail', 'quoteClientPhone', 'quoteProductName', 'quoteCategory', 'quoteQty', 'quoteSpecs'];
        const qMap = {
            quoteClientName: 'quote-group-name',
            quoteClientEmail: 'quote-group-email',
            quoteClientPhone: 'quote-group-phone',
            quoteProductName: 'quote-group-product',
            quoteCategory: 'quote-group-category',
            quoteQty: 'quote-group-qty',
            quoteSpecs: 'quote-group-specs'
        };

        const validateQuoteField = (id) => {
            const val = document.getElementById(id).value.trim();
            let valid = true;
            if (id === 'quoteClientName') valid = val.length >= 3;
            if (id === 'quoteClientEmail') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            if (id === 'quoteClientPhone') valid = val.replace(/\D/g, '').length >= 10;
            if (id === 'quoteProductName') valid = val.length >= 2;
            if (id === 'quoteCategory') valid = val !== '';
            if (id === 'quoteQty') valid = Number(val) >= 1;
            if (id === 'quoteSpecs') valid = val.length >= 10;
            document.getElementById(qMap[id]).classList.toggle('invalid', !valid);
            return valid;
        };

        qFields.forEach(id => document.getElementById(id).addEventListener('input', () => validateQuoteField(id)));

        quoteForm.addEventListener('submit', e => {
            e.preventDefault();
            if (qFields.map(validateQuoteField).every(Boolean)) {
                const folio = 'COT-' + Math.floor(100000 + Math.random() * 900000);
                const clientName = document.getElementById('quoteClientName').value.trim();
                const clientEmail = document.getElementById('quoteClientEmail').value.trim();
                const clientPhone = document.getElementById('quoteClientPhone').value.trim();
                const prod = document.getElementById('quoteProductName').value.trim();
                const category = document.getElementById('quoteCategory').value;
                const qty = document.getElementById('quoteQty').value;
                const budget = document.getElementById('quoteBudget').value.trim();
                const specs = document.getElementById('quoteSpecs').value.trim();

                const subject = encodeURIComponent(`[AETHERIA Cotización ${folio}] ${prod} (x${qty})`);
                const body = encodeURIComponent(
                    `Hola Hugo Ayala,\n\nNueva solicitud de cotización desde AETHERIA:\n\n` +
                    `• Folio: ${folio}\n` +
                    `• Cliente: ${clientName}\n` +
                    `• Correo: ${clientEmail}\n` +
                    `• Teléfono: ${clientPhone}\n` +
                    `• Producto buscado: ${prod}\n` +
                    `• Categoría: ${category}\n` +
                    `• Cantidad: ${qty}\n` +
                    `• Presupuesto estimado: ${budget ? '$' + formatMXN(budget) + ' MXN' : 'No especificado'}\n` +
                    `• Especificaciones:\n${specs}\n`
                );

                window.open(`mailto:hugo-saul@hotmail.com?subject=${subject}&body=${body}`, '_blank');

                const banner = document.getElementById('quoteSuccessBanner');
                banner.innerHTML = `✓ Cotización <strong>${folio}</strong> para <strong>"${prod}"</strong> (x${qty}) dirigida a <strong>hugo-saul@hotmail.com</strong>.`;
                banner.style.display = 'block';
                UI.toast(`✓ Cotización ${folio} enviada a Hugo Ayala`);
                quoteForm.reset();
                document.getElementById('quoteQty').value = '1';
            }
        });
    }
});