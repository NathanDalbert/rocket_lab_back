# 🛍️ API de E-commerce (Backend)

Este é um projeto backend desenvolvido com **NestJS**, **TypeScript** e **TypeORM**, utilizando **SQLite** como banco de dados. Ele permite o gerenciamento completo de produtos, carrinhos de compras dinâmicos e processamento de pedidos com lógica transacional.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **ORM:** TypeORM
- **Banco de Dados:** SQLite
- **Testes:** Jest
- **Documentação da API:** Swagger (OpenAPI)
- **Ambiente de Execução:** Node.js (npm)

---

## 🎯 Funcionalidades

### 📦 Produtos
- CRUD completo

### 🛒 Carrinho de Compras
- Criação automática de carrinho
- Adição inteligente de itens
- Visualização e listagem de carrinhos
- Atualização de quantidade dos itens
- Remoção de itens do carrinho
- Limpeza total do carrinho

### 📑 Pedidos
- Criação de pedidos a partir de um carrinho existente
- Atualização automática de estoque
- Lógica transacional para consistência
- Listagem e visualização de pedidos
- Atualização do status do pedido

### ✅ Validações e Serializações
- DTOs com `class-validator` para validação de entrada
- `ClassSerializerInterceptor` para resposta formatada e tratamento de laços circulares

---

## 🔧 Como Executar o Projeto

### ✅ Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (vem junto com o Node.js)
- Git

### 📥 Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/NathanDalbert/rocket_lab_back.git](https://github.com/NathanDalbert/rocket_lab_back.git)
    ```

2.  **Acesse o diretório do projeto:**
    ```bash
    cd rocket_lab_back
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure o Banco de Dados (SQLite):**
    Este projeto usa SQLite por padrão. O TypeORM criará automaticamente o arquivo `db/database.sqlite` na primeira execução, desde que a opção `synchronize` esteja ativada no arquivo de configuração do TypeORM.

5.  **Execute a aplicação em modo de desenvolvimento:**
    ```bash
    npm run start:dev
    ```

### ✅ Executando os Testes

Este projeto utiliza Jest para testes automatizados.

1.  **Para rodar os testes:**
    ```bash
    npm run test
    ```

2.  **Para gerar um relatório de cobertura de testes:**
    ```bash
    npm run test:cov
    ```
