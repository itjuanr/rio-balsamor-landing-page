# 🍹 Rio Balsamor - Landing Page

> Uma experiência digital que traz a energia vibrante e a cultura acolhedora do Rio de Janeiro.

![Status do Projeto](https://img.shields.io/badge/Status-Finalizado-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Sobre o Projeto

O **Rio Balsamor** é um projeto de uma marca fictícia de restaurante e bar carioca, focado em alta gastronomia e coquetelaria autoral.

Este projeto foi desenvolvido através de uma **colaboração multidisciplinar** entre Design e Desenvolvimento. O objetivo foi simular um ambiente real de agência/startup, abrangendo todo o ciclo de vida do produto:

1.  **Criação da Marca:** Desenvolvimento da identidade visual e conceito da "empresa" do zero.
2.  **Briefing & Stakeholders:** Reuniões de alinhamento entre designers e partes interessadas para definir requisitos.
3.  **Desenvolvimento:** Implementação do layout em uma Landing Page responsiva e interativa.

## 🚀 Tecnologias Utilizadas

O site é estático e não tem nenhuma dependência: sem framework, sem biblioteca, sem etapa de build.

* ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) **HTML5 Semântico**
* ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) **CSS3** (custom properties, grid, scroll-snap e animações)
* ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) **JavaScript puro**

## 🎨 Funcionalidades

* **Design Responsivo:** Adaptável para mobile, tablet e desktop.
* **Menu Hambúrguer:** Navegação por âncoras, com menu acessível por teclado no mobile.
* **Flip Cards Interativos:** Os cards de coquetéis giram ao passar o mouse, tocar ou clicar, revelando os ingredientes e a história da bebida.
* **Carrosséis:** Carta de drinks e banners de promoções construídos sobre scroll nativo (arraste no toque, setas e indicadores).
* **Reserva de Mesa:** Formulário com validação e horários que acompanham o funcionamento da casa.
* **Formulário de Feedback:** Seção de contato integrada ao rodapé.
* **Acessibilidade:** Foco visível, textos alternativos e respeito a `prefers-reduced-motion`.

> Os formulários são demonstrativos: validam e confirmam na própria página, mas nada é enviado, pois o projeto não tem back-end.

## 📁 Estrutura

```
├── index.html
├── 404.html
└── assets/
    ├── css/styles.css
    ├── js/main.js
    ├── fonts/          # Recoleta (woff2)
    └── img/
        ├── brand/      # logos, emblema e favicons
        ├── drinks/     # fotos dos coquetéis
        ├── promos/     # banners de promoções
        └── about/
```

## 🔧 Como Executar

Como este é um projeto estático, não requer instalação de dependências.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/itjuanr/rio-balsamor-landing-page.git
    ```
2.  **Acesse a pasta:**
    ```bash
    cd rio-balsamor-landing-page
    ```
3.  **Abra o arquivo:**
    Basta abrir o arquivo `index.html` em seu navegador preferido.
    *Dica: Para uma melhor experiência, utilize a extensão "Live Server" do VSCode.*

---
Desenvolvido com 💙 e muita criatividade.
