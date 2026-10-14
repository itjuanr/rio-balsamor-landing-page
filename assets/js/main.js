(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function initHeader() {
        const header = document.querySelector('[data-header]');
        const toggle = document.querySelector('[data-nav-toggle]');
        const nav = document.querySelector('[data-nav]');
        if (!header || !toggle || !nav) return;

        const label = toggle.querySelector('.visually-hidden');

        function setOpen(open) {
            header.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            label.textContent = open ? 'Fechar menu' : 'Abrir menu';
        }

        toggle.addEventListener('click', function () {
            setOpen(!header.classList.contains('is-open'));
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && header.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener('click', function (event) {
            if (!header.contains(event.target)) setOpen(false);
        });

        function onScroll() {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Carrossel sobre scroll nativo: o arraste no toque vem de graça e o JS só cuida dos botões.
    function initCarousel(root) {
        const track = root.querySelector('[data-carousel-track]');
        const prev = root.querySelector('[data-carousel-prev]');
        const next = root.querySelector('[data-carousel-next]');
        const dotsHost = root.querySelector('[data-carousel-dots]');
        const slides = Array.from(track.children);
        const loop = root.hasAttribute('data-loop');
        const interval = Number(root.dataset.autoplay) || 0;
        const tolerance = 4;
        let dots = [];
        let timer = null;

        function maxScroll() {
            return track.scrollWidth - track.clientWidth;
        }

        function scrollToLeft(left) {
            track.scrollTo({ left: left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        }

        function goNext() {
            if (track.scrollLeft >= maxScroll() - tolerance) {
                if (loop) scrollToLeft(0);
                return;
            }
            const target = slides.find(function (slide) {
                return slide.offsetLeft > track.scrollLeft + tolerance;
            });
            scrollToLeft(target ? target.offsetLeft : maxScroll());
        }

        function goPrev() {
            if (track.scrollLeft <= tolerance) {
                if (loop) scrollToLeft(maxScroll());
                return;
            }
            const before = slides.filter(function (slide) {
                return slide.offsetLeft < track.scrollLeft - tolerance;
            });
            scrollToLeft(before.length ? before[before.length - 1].offsetLeft : 0);
        }

        function currentIndex() {
            let closest = 0;
            slides.forEach(function (slide, index) {
                const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
                if (distance < Math.abs(slides[closest].offsetLeft - track.scrollLeft)) closest = index;
            });
            return closest;
        }

        function update() {
            if (!loop) {
                prev.disabled = track.scrollLeft <= tolerance;
                next.disabled = track.scrollLeft >= maxScroll() - tolerance;
            }
            const active = currentIndex();
            dots.forEach(function (dot, index) {
                dot.setAttribute('aria-current', String(index === active));
            });
        }

        function stop() {
            clearInterval(timer);
            timer = null;
        }

        function start() {
            if (!interval || timer || reducedMotion.matches) return;
            timer = setInterval(function () {
                if (!document.hidden) goNext();
            }, interval);
        }

        // Depois que a pessoa assume o controle, o carrossel para de girar sozinho.
        function takeOver() {
            stop();
            root.removeEventListener('pointerleave', start);
            root.removeEventListener('focusout', start);
        }

        if (dotsHost) {
            dots = slides.map(function (slide, index) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', 'Ir para o banner ' + (index + 1));
                dot.addEventListener('click', function () {
                    takeOver();
                    scrollToLeft(slide.offsetLeft);
                });
                dotsHost.appendChild(dot);
                return dot;
            });
        }

        prev.addEventListener('click', function () {
            takeOver();
            goPrev();
        });
        next.addEventListener('click', function () {
            takeOver();
            goNext();
        });

        let frame = null;
        track.addEventListener('scroll', function () {
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;
                update();
            });
        }, { passive: true });
        window.addEventListener('resize', update);

        if (interval) {
            track.addEventListener('pointerdown', takeOver);
            root.addEventListener('pointerenter', stop);
            root.addEventListener('focusin', stop);
            root.addEventListener('pointerleave', start);
            root.addEventListener('focusout', start);
            start();
        }

        update();
    }

    function initDrinks() {
        document.querySelectorAll('.drink__card').forEach(function (card) {
            card.addEventListener('click', function () {
                card.classList.toggle('is-flipped');
            });
            card.addEventListener('pointerleave', function (event) {
                if (event.pointerType === 'mouse') card.classList.remove('is-flipped');
            });
        });
    }

    function initReveal() {
        const items = document.querySelectorAll('[data-reveal]');
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (item) {
                item.classList.add('is-visible');
            });
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        items.forEach(function (item) {
            observer.observe(item);
        });
    }

    function pad(number) {
        return String(number).padStart(2, '0');
    }

    function toISODate(date) {
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    function parseISODate(value) {
        const parts = value.split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    // Os horários oferecidos seguem o funcionamento da casa:
    // seg a sex abre às 12h, sáb e dom às 18h. Última reserva uma hora e meia antes de fechar.
    function initReservation() {
        const form = document.querySelector('[data-form="reservation"]');
        if (!form) return;

        const dateField = form.elements.date;
        const timeField = form.elements.time;

        function fillTimes() {
            const previous = timeField.value;
            timeField.length = 0;

            if (!dateField.value) {
                timeField.add(new Option('Escolha a data', ''));
                return;
            }

            const now = new Date();
            const date = parseISODate(dateField.value);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = dateField.value === toISODate(now);
            const earliest = now.getHours() * 60 + now.getMinutes() + 30;
            const first = (isWeekend ? 18 : 12) * 60;
            const last = (isWeekend ? 23 : 22) * 60 + 30;

            for (let minutes = first; minutes <= last; minutes += 30) {
                if (isToday && minutes < earliest) continue;
                const label = pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
                timeField.add(new Option(label, label));
            }

            if (!timeField.length) {
                timeField.add(new Option('Sem horários para hoje', ''));
                return;
            }

            const keep = Array.from(timeField.options).some(function (option) {
                return option.value === previous;
            });
            const fallback = Array.from(timeField.options).find(function (option) {
                return option.value >= '20:00';
            });
            timeField.value = keep ? previous : (fallback || timeField.options[0]).value;
        }

        function setDefaults() {
            const day = new Date();
            dateField.min = toISODate(day);
            dateField.value = toISODate(day);
            fillTimes();

            // Se já passou do último horário de hoje, começa sugerindo amanhã.
            if (!timeField.value) {
                day.setDate(day.getDate() + 1);
                dateField.value = toISODate(day);
                fillTimes();
            }
        }

        dateField.addEventListener('change', fillTimes);
        // O evento "reset" dispara antes de os campos voltarem ao valor inicial.
        form.addEventListener('reset', function () {
            setTimeout(setDefaults, 0);
        });
        setDefaults();
    }

    function reservationSummary(form) {
        const data = new FormData(form);
        const guests = Number(data.get('guests'));
        const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
            .format(parseISODate(data.get('date')));
        const firstName = String(data.get('name')).trim().split(/\s+/)[0];
        return firstName + ', sua mesa para ' + guests + (guests === 1 ? ' pessoa' : ' pessoas') +
            ' foi solicitada para ' + date + ', às ' + data.get('time') + '.';
    }

    function errorMessage(field) {
        const validity = field.validity;
        if (validity.valueMissing) return field.tagName === 'SELECT' ? 'Selecione uma opção.' : 'Preencha este campo.';
        if (validity.typeMismatch && field.type === 'email') return 'Informe um e-mail válido.';
        if (validity.patternMismatch) return field.dataset.patternMessage || 'Formato inválido.';
        if (validity.rangeUnderflow) return 'Escolha uma data a partir de hoje.';
        if (validity.tooShort) return 'Use pelo menos ' + field.minLength + ' caracteres.';
        return field.validationMessage;
    }

    function showError(field) {
        const wrapper = field.closest('.field');
        let error = wrapper.querySelector('.field__error');

        if (field.validity.valid) {
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
            if (error) error.remove();
            return;
        }

        if (!error) {
            error = document.createElement('p');
            error.className = 'field__error';
            error.id = field.id + '-error';
            wrapper.appendChild(error);
        }
        error.textContent = errorMessage(field);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', error.id);
    }

    // Projeto sem back-end: os formulários validam e confirmam na própria página, nada é enviado.
    function initForms() {
        document.querySelectorAll('form[data-form]').forEach(function (form) {
            const success = form.parentElement.querySelector('[data-form-success]');
            const summary = success.querySelector('[data-form-summary]');
            form.noValidate = true;

            function fields() {
                return Array.from(form.elements).filter(function (field) {
                    return field.willValidate && field.tagName !== 'BUTTON';
                });
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                fields().forEach(showError);

                const firstInvalid = fields().find(function (field) {
                    return !field.validity.valid;
                });
                if (firstInvalid) {
                    firstInvalid.focus();
                    return;
                }

                if (summary) summary.textContent = reservationSummary(form);
                form.hidden = true;
                success.hidden = false;
                success.focus();
            });

            form.addEventListener('input', function (event) {
                if (event.target.hasAttribute('aria-invalid')) showError(event.target);
            });

            success.querySelector('[data-form-reset]').addEventListener('click', function () {
                form.reset();
                success.hidden = true;
                form.hidden = false;
                fields()[0].focus();
            });
        });
    }

    initHeader();
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
    initDrinks();
    initReveal();
    initReservation();
    initForms();
})();
