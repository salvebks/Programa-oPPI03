import express from 'express';
import session from 'express-session';
// endereço e porta do servidor
const host = 'localhost';
const port = 3000;

// criando a aplicação usando express
const app = express();
// a sessao devera ser parametrizada com uma chave secreta
app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true, //a cada requisicao, a sessao sera salva, mesmo que nao tenha sido modificada
    saveUninitialized: true, //a sessao sera salva mesmo que nao tenha sido inicializada
    cookie: {
        secure: false, //false para desenvolvimento e true para producao (https)
        httpOnly: true, //false para desenvolvimento e true para producao
        maxAge: 1000 * 60 * 15 //tempo de vida do cookie em milissegundos (15 minutos)
    }
}));
// permite usar arquivos estáticos da pasta public (imagens, css, etc)
app.use(express.static('public'));

// permite ler dados enviados por formulário
app.use(express.urlencoded({ extended: false }));

// vetor que vai armazenar os fornecedores cadastrados
var fornecedores = [];

// função para gerar o menu de navegação
function menu(requisicao) {
  return `
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
<div class="container-fluid">
<div>
<a class="btn btn-outline-light m-1" href="/home">Home</a>
<a class="btn btn-outline-light m-1" href="/fornecedor">Cadastro Fornecedor</a>
<a class="btn btn-outline-light m-1" href="/login">Login</a>
<a class="btn btn-outline-light m-1" href="/logout">Logout</a>
</div>
</div>
<div>
${requisicao?.session?.usuario ? `<span class="navbar-text text-light">Logado como: ${requisicao.session.usuario.email}</span>` : ''}
</div>
</nav>
`;
}






// rota da página inicial
app.get('/', (requisicao,resposta)=>{
    resposta.redirect("/login");
});
app.get('/home', estaLogado, (requisicao, resposta) => {
    resposta.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>Home</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    ${menu(requisicao)}

    <div class="container mt-5">
        <h2>Bem-vindo ao sistema!</h2>
    </div>

    </body>
    </html>
    `);
});
// página que mostra o formulário de cadastro de fornecedor
app.get('/fornecedor', estaLogado, (requisicao,resposta)=>{

// cria as linhas da tabela com os fornecedores cadastrados
let lista = fornecedores.map(f => `
<tr>
<td>${f.cnpj}</td>
<td>${f.razao}</td>
<td>${f.fantasia}</td>
<td>${f.cidade}</td>
<td>${f.email}</td>
<td>${f.telefone}</td>
<td>${f.endereco}</td>
<td>${f.uf}</td>
<td>${f.cep}</td>

</tr>
`).join("");

resposta.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Fornecedor</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

${menu(requisicao)}

<div class="container mt-4">

<h2>Cadastro de Fornecedor</h2>

<!-- formulário de cadastro -->
<form action="/fornecedor" method="POST">

CNPJ
<input class="form-control" name="cnpj">

Razão Social
<input class="form-control" name="razao">

Nome Fantasia
<input class="form-control" name="fantasia">

Endereço
<input class="form-control" name="endereco">

Cidade
<input class="form-control" name="cidade">

UF
<input class="form-control" name="uf">

CEP
<input class="form-control" name="cep">

Email
<input class="form-control" name="email">

Telefone
<input class="form-control" name="telefone">

SENHA   
<input class="form-control" type="password" name="senha">
<br>

<button class="btn btn-primary">Cadastrar</button>

</form>

<hr>

<h3>Empresas Cadastradas</h3>

<!-- tabela com fornecedores cadastrados -->
<table class="table table-bordered">

<tr>
<th>CNPJ</th>
<th>Razão Social</th>
<th>Fantasia</th>
<th>Cidade</th>
<th>Email</th>
<th>Telefone</th>
<th>Endereço</th>
<th>UF</th>
<th>CEP</th>
</tr>

${lista}

</table>

</div>

</body>
</html>
`);
});


// rota que recebe os dados do formulário de fornecedor
app.post('/fornecedor',estaLogado,(requisicao,resposta)=>{


// pegando os dados enviados pelo formulário
const {cnpj,razao,fantasia,endereco,cidade,uf,cep,email,telefone,senha} = requisicao.body;

// vetor para armazenar mensagens de erro
let erros = [];

// validação dos campos obrigatórios
if(!cnpj) erros.push("CNPJ não informado");
if(!razao) erros.push("Razão social não informada");
if(!fantasia) erros.push("Nome fantasia não informado");
if(!endereco) erros.push("Endereço não informado");
if(!cidade) erros.push("Cidade não informada");
if(!uf) erros.push("UF não informada");
if(!cep) erros.push("CEP não informado");
if(!email) erros.push("Email não informado");
if(!telefone) erros.push("Telefone não informado");

// verificando se já existe algum dado repetido
if(fornecedores.some(f => f.cnpj === cnpj)){
erros.push("CNPJ já cadastrado");
}
if(fornecedores.some(f => f.email === email)){
erros.push("Email já cadastrado");
}
if(fornecedores.some(f => f.telefone === telefone)){
erros.push("Telefone já cadastrado");
}
if(fornecedores.some(f => f.razao === razao)){
erros.push("Razão social já cadastrada");
}
if(fornecedores.some(f => f.fantasia === fantasia)){
erros.push("Nome fantasia já cadastrado");
}
if(fornecedores.some(f => f.endereco === endereco)){
erros.push("Endereço já cadastrado");
}

// se houver erros mostra mensagem na tela
if(erros.length>0){

resposta.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Erro</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

${menu(requisicao)}

<div class="container mt-5">

<div class="alert alert-danger">

<h3>Erro no Cadastro</h3>

${erros.join("<br>")}

<br><br>

<a href="/fornecedor" class="btn btn-primary">Voltar</a>

</div>

</div>

</body>
</html>
`);

}
else{

// se não tiver erro, adiciona fornecedor na lista
fornecedores.push({cnpj,razao,fantasia,endereco,cidade,uf,cep,email,telefone,senha});

// redireciona de volta para a página de fornecedores
resposta.redirect("/fornecedor");

}

});


// página de login
app.get('/login', (requisicao,resposta)=>{

resposta.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>


<body>



<div class="container mt-5">

<h2>Login</h2>

<!-- formulário de login -->
<form method="POST" action="/login">


Email
<input class="form-control" name="email">

Senha
<input class="form-control" type="password" name="senha">

<br>

<button class="btn btn-success">Entrar</button>

</form>

</div>

</body>
</html>
`);

});


// rota que processa o login
app.post('/login',(requisicao,resposta)=>{

const {email,senha} = requisicao.body;

let erros = [];

// validação dos campos
if(!email) erros.push("Email não informado");
if(!senha) erros.push("Senha não informada");

if(erros.length > 0){
  return resposta.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Erro de Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body>
    <div class="container mt-5">
      <div class="alert alert-danger">
        <h3>Erro no Login</h3>
        ${erros.join('<br>')}
        <br><br>
        <a href="/login" class="btn btn-primary">Voltar</a>
      </div>
    </div>
  </body>
  </html>
  `);
}

// validacao estatica
if(email == "admin@empresa.com" && senha == "123456"){
   requisicao.session.logado = true; //armazenando o status de login na sessão
    requisicao.session.usuario = {email}; //armazenando o email do usuário logado na sessão
    resposta.redirect("/home");
}else{
    resposta.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
<h2>Login</h2>
<!-- formulário de login -->
<form method="POST" action="/login">
Email
<input class="form-control" name="email">
Senha
<input class="form-control" type="password" name="senha">
<span class="text-danger">Email ou senha incorretos</span>
<br>
<button class="btn btn-success">Entrar</button>
</form>
</div>
</body>
</html>
`);
}
});


// rota de logout
app.get('/logout',estaLogado,(requisicao,resposta)=>{

    requisicao.session.destroy();

    resposta.redirect("/login");
});

//Middleware para verificar se o usuário está logado
function estaLogado(requisicao,resposta,next){
    if(requisicao.session?.logado){
         next();
    }else{
        resposta.redirect("/login");
        }
}
// inicia o servidor
app.listen(port, host, () => {
console.log(`Servidor rodando em http://${host}:${port}`);
});
