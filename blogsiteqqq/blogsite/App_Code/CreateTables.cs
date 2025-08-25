// Mesajlaşma tabloları
public static void CreateMessagingTables()
{
    using (var conn = new SqlConnection(GenelIslemler.ConnectionString))
    {
        conn.Open();
        
        // Conversations tablosu
        using (var cmd = new SqlCommand(@"
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Conversations]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[Conversations] (
                    [ConversationID] [int] IDENTITY(1,1) NOT NULL,
                    [User1ID] [int] NOT NULL,
                    [User2ID] [int] NOT NULL,
                    [CreatedAt] [datetime] NOT NULL,
                    [LastMessageTime] [datetime] NOT NULL,
                    [LastMessage] [nvarchar](max) NULL,
                    CONSTRAINT [PK_Conversations] PRIMARY KEY CLUSTERED ([ConversationID] ASC),
                    CONSTRAINT [FK_Conversations_User1] FOREIGN KEY([User1ID]) REFERENCES [dbo].[Kullanicilar] ([KullaniciID]),
                    CONSTRAINT [FK_Conversations_User2] FOREIGN KEY([User2ID]) REFERENCES [dbo].[Kullanicilar] ([KullaniciID])
                )
            END", conn))
        {
            cmd.ExecuteNonQuery();
        }
        
        // Messages tablosu
        using (var cmd = new SqlCommand(@"
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[Messages] (
                    [MessageID] [int] IDENTITY(1,1) NOT NULL,
                    [ConversationID] [int] NOT NULL,
                    [SenderID] [int] NOT NULL,
                    [ReceiverID] [int] NOT NULL,
                    [Content] [nvarchar](max) NOT NULL,
                    [CreatedAt] [datetime] NOT NULL,
                    [IsRead] [bit] NOT NULL DEFAULT(0),
                    CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED ([MessageID] ASC),
                    CONSTRAINT [FK_Messages_Conversations] FOREIGN KEY([ConversationID]) REFERENCES [dbo].[Conversations] ([ConversationID]),
                    CONSTRAINT [FK_Messages_Sender] FOREIGN KEY([SenderID]) REFERENCES [dbo].[Kullanicilar] ([KullaniciID]),
                    CONSTRAINT [FK_Messages_Receiver] FOREIGN KEY([ReceiverID]) REFERENCES [dbo].[Kullanicilar] ([KullaniciID])
                )
            END", conn))
        {
            cmd.ExecuteNonQuery();
        }
    }
} 