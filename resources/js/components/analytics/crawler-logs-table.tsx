import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { CrawlerLog, BOT_ICONS } from '@/types/crawler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface CrawlerLogsTableProps {
  logs: CrawlerLog[];
}

export function CrawlerLogsTable({ logs }: CrawlerLogsTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Bot Name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>User Agent</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.timestamp), "M/d/yyyy, h:mm:ss a")}</TableCell>
              <TableCell className="flex items-center gap-2">
                <img
                  alt={`${log.botName} icon`}
                  className="h-4 w-4"
                  src={BOT_ICONS[log.botName] || '/llm-icons/generic.svg'}
                />
                {log.botName}
              </TableCell>
              <TableCell>{log.ipAddress}</TableCell>
              <TableCell 
                className="max-w-xs truncate" 
                title={log.userAgent}
              >
                {log.userAgent}
              </TableCell>
              <TableCell>{log.path}</TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-medium",
                  log.status >= 200 && log.status < 300 && "text-green-600",
                  log.status >= 300 && log.status < 400 && "text-yellow-600",
                  log.status >= 400 && log.status < 500 && "text-red-600",
                  log.status >= 500 && "text-red-700"
                )}>
                  {log.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}