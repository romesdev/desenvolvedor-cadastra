# Loja Cadastra

Objetivo: replicar o layout no [figma](https://www.figma.com/file/Z5RCG3Ewzwm7XIPuhMUsBZ/Desafio-Cadastra?type=design&node-id=0%3A1&mode=design&t=A0G2fRjMSrcQjchw-1) com boas práticas.

## Funcionalidades

- Requisição a API para obter os produtos;
- Funcionalidade: Filtrar produtos por cor, tamanho e preço;
- Funcionalidade: Adicionar produto ao carrinho.
- Funcionalidade: Carregar mais produtos.

### Como usar?

O projeto possui um setup pronto no qual há a necessidade de possuir o `nodejs` instalado na versão 14 ou superior.

Para instalar as dependências só é preciso executar o comando: `npm install`

Para dar start no server e nos processos para desenvolvimento é necessário rodar o comando: `npm start `

Uma ver que o comando é dado ele irá levantar 2 servidores, sendo eles:
 - um para acessar o front-end que roda na porta 3000. No qual pode ser acessado pela url: http://localhost:3000
 - um para o json-server que irá export uma api com a lista de produtos que roda na porta 5000. Para acessar os produtos é na url:  http://localhost:5000/products

#### Autor

Desenvolvido por @romesdev.

E-mail para contato: romesfilho.cc@gmail.com