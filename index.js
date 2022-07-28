const qrcode = require('qrcode-terminal');
const { rastrearEncomendas  } = require('correios-brasil');


const { Client, NoAuth } = require('whatsapp-web.js');
const client = new Client({authStrategy: new NoAuth()});

var codRastreio;

function rastreia(){
   rastrearEncomendas(codRastreio).then(response => {
    try {
        const dados = response[0].eventos.reverse()
        /*console.log(dados);*/

        rastreioCompleto = dados.map((atualizacao)=>console.log(`📌 ${atualizacao.descricao} 📅 ${atualizacao.dtHrCriado}`))
        // O reverse é apenas para organizarmos os dados do rastreio do mais antigo para o mais recente !
      } catch (error) {
        // bloco de tratamento do erro
        console.log(error);
      } 
    
      })
}



client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
	if(message.body.slice(0,3) != '!rs') {
		client.sendMessage(message.from, '🙂 Olá.\n para rastrear um pacote digite:!rs + CÓDIGO. \n\n🟢 Exemplo : !rs NL123456789BR.');
	}
});


client.on('message', message => {
	if(message.body.slice(0,3) === '!rs') {
        message.reply('⌛ Aguarde...');
        var codigoInformado = message.body.slice(4)

        codRastreio = [codigoInformado];
        console.log(codRastreio);
        rastreia()

        rastrearEncomendas(codRastreio).then(response => {
            try {
                const dados = response[0].eventos.reverse()
                console.log(dados);
        
              dados.map((atualizacao)=> client.sendMessage(message.from, `${`${atualizacao.descricao == "Objeto entregue ao destinatário" ? "🟢" : atualizacao.descricao == "Objeto postado" ? "🟡" : "🚐"}  ${atualizacao.descricao} \n\n📅 ${atualizacao.dtHrCriado.slice(8,10)}/${atualizacao.dtHrCriado.slice(5,7)}/${atualizacao.dtHrCriado.slice(0,4)} `}`))
                // O reverse é apenas para organizarmos os dados do rastreio do mais antigo para o mais recente !
              } catch (error) {
                console.log(error);
              } 
              })

          client.sendMessage(message.from, rastreio);
	}
});

client.initialize();